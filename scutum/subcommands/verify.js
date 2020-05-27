const openpgp = require("../openpgp");
const util = require("../util");
const read_keys = require("../io/read_keys");
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
function check_verification(verification, not_before, not_after){
    if(true !== verification.valid) return;
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

    let not_before = false, not_after = new Date();

    try{
        if(null != args["--not-before"]){
            not_before = util.parse_date(args["--not-before"]);
        }
        if(null != args["--not-after"]){
            not_after = util.parse_date(args["--not-after"]);
        }
    } catch(e) {
        stderr.throw(e);
    }

    const inputs = [args.SIGNATURES].concat(args.CERTS);

    const signatures = await read_signatures(inputs, function(sig){
        return (sig !== undefined);
    });

    const public_keys = (await read_keys(inputs, function(key){
        return (key !== undefined);
    })).map((key) => {
        // we allow private keys as input, as they can be converted to public
        if(key.isPublic()) return key;
        return key.toPublic();
    });

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

        const verifications = (await openpgp.verify({
            message: message,
            signature: signature,
            publicKeys: public_keys,
        })).signatures;

        // examine verifications result, each verification corresponding to a
        // public key

        for(let verification of verifications){
            let check_result = check_verification(
                verification,
                not_before,
                not_after
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

            stdout([
                creation.toISOString(),
                signingKey.getFingerprint().toUpperCase(),
                primaryKey.getFingerprint().toUpperCase(),
                "."
            ].join(' ') + "\n");

        }

    }

    if(!ever_accepted){
        stderr.throw("no_signature");
    } else {
        stderr.throw("ok");
    }


}
