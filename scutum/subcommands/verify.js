const openpgp = require("../openpgp");
const util = require("../util");
const read_keys = require("../io/read_keys");
const read_public_keys = require("../io/read_public_keys");
const read_signatures = require("../io/read_signatures");

require("../router").register(
    "verify [--not-before=DATE] [--not-after=DATE] [--] SIGNATURES CERTS [CERTS...]",
    subcommand
);



/**
 * Check a single verify result, as returned by OpenPGP.js, is acceptable
 * according to our conditions. It must be valid by itself, and fall into
 * data range defined by user.
 */
async function check_verification(verification, not_before, not_after){
    if(verification.valid !== undefined && true !== verification.valid) return;
    if(verification.verified !== undefined){
        if(!(await verification.verified)) return;
    }
    const creation = verification.signature.packets[0].created;
    const creation_timestamp = creation.getTime();

    if(not_before != false && creation < not_before.getTime()) return;
    if(not_after != false && creation > not_after.getTime()) return;

    return { creation: creation };
}


/**
 * Find out which key was used to generate a signature. Code copied from
 * OpenPGP.js, at <https://github.com/openpgpjs/openpgpjs/blob/master/src/message.js>
 */
async function get_primary_and_signing_key(keys, issuer_key_id){
    let signingKey = null, primaryKey = null;
    await Promise.all(keys.map(async function(key) {
        // Look for the unique key that matches issuerKeyId of signature
        try {
            signingKey = await key.getSigningKey(issuer_key_id, null);
            primaryKey = key;
        } catch(e) {
        }
    }));
    return { signingKey, primaryKey };
}



async function subcommand(args, options){
    const { stdin, stdout, stderr } = options;

    const not_before = args["--not-before"],
          not_after = args["--not-after"];

    const inputs = [args.SIGNATURES].concat(args.CERTS);

    const signatures = await read_signatures(inputs, function(sig){
        return (sig !== undefined);
    });

    const public_keys = await read_public_keys(inputs);

    // ensure all inputs are valid
    if(signatures.length + public_keys.length != inputs.length){
        stderr.throw("bad_data");
    }

    const data_to_verify = await util.stream_readall(stdin);
    const message = await openpgp.message.fromBinary(data_to_verify);

    let ever_accepted = false;

    for(let signature of signatures){
        // verify each provided signature file, against all public keys
        // supplied

        const verify_result = await openpgp.verify({
            message: message,
            signature: signature,
            publicKeys: public_keys,
        });

        const verify_result_parsed = await read_verification(
            public_keys,
            verify_result.signatures,
            not_before,
            not_after
        );
        if(verify_result_parsed.length > 0) ever_accepted = true;
        stdout(verifications_to_string(verify_result_parsed));

    }

    if(!ever_accepted){
        stderr.throw("no_signature");
    } else {
        stderr.throw("ok");
    }


}


/**
 * Verify a message with given arguments to openpgp.verify, then interprete
 * the results. Returns { creation, signing_key_fingerprint,
 * primary_key_fingerprint } for each successful verified signature.
 *
 * @param {str} not_before - Optional. An ISO-8601 string indicating the
 *                           earliest creation date at which a signature may be
 *                           accepted. Defaults to start of time.
 * @param {str} not_after  - Optional. An ISO-8601 string indicating the
 *                           latest creation date at which a signature may be
 *                           accepted. Defaults to current time.
 */

async function read_verification(public_keys, verifications, not_before, not_after){
    const ret = [];

    let date_not_before = false,
        date_not_after = new Date();

    try{
        if(null != not_before){
            date_not_before = util.parse_date(not_before);
        }
        if(null != not_after){
            date_not_after = util.parse_date(not_after);
        }
    } catch(e) {
        throw Error(e);
    }

    // examine verifications result, each verification corresponding to a
    // public key

    for(let verification of verifications){
        let check_result = await check_verification(
            verification,
            date_not_before,
            date_not_after
        );
        if(!check_result) continue;

        ever_accepted = true;

        const creation = check_result.creation;
        const issuer_key_id = verification.keyid;
        
        const { signingKey, primaryKey } = 
            await get_primary_and_signing_key(
                public_keys,
                issuer_key_id 
            );

        ret.push({
            creation: creation,
            signing_key_fingerprint: signingKey.getFingerprint().toUpperCase(),
            primary_key_fingerprint: primaryKey.getFingerprint().toUpperCase(),
        });
    }

    return ret;
}


function verifications_to_string(list){
    const ret = [];
    for(let {    
        creation,
        signing_key_fingerprint,
        primary_key_fingerprint
    } of list){
        ret.push([
            creation.toISOString(),
            signing_key_fingerprint,
            primary_key_fingerprint,
        ].join(" "));
    }
    return ret.join("\n");
}


module.exports.read_verification = read_verification;
module.exports.verifications_to_string = verifications_to_string;
