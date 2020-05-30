const openpgp = require("../openpgp");
const enums = openpgp.enums;
const util = require("../util");
const file_input = require("../io/file_input");
const read_keys = require("../io/read_keys");
const read_public_keys = require("../io/read_public_keys");
const read_passwords = require("../io/read_passwords");

const do_verification = require("./verify");

require("../router").register(
    "decrypt [--session-key-out=SESSIONKEY] [--with-session-key=SESSIONKEY...] [--with-password=PASSWORD...] [--verify-out=VERIFICATIONS [--verify-with=CERTS...] [--verify-not-before=DATE] [--verify-not-after=DATE] ] [--] [KEY...]",
    subcommand
);



async function subcommand(args, options){
    const { stdin, stdout, stderr } = options;

    const output_session_key = args["--session-key-out"],
          output_verification = args["--verify-out"];

    const input_session_keys = args["--with-session-key"],
          input_passwords = args["--with-password"],
          input_keys = args["KEY"];

    const input_verify_publickeys = args["--verify-with"],
          input_verify_not_before = args["--verify-not-before"],
          input_verify_not_after = args["--verify-not-after"];


    // Interprete user's intent, and file errors when incomplete arguments
    // are given

    if(
        input_session_keys.length < 1 &&
        input_passwords.length < 1 &&
        input_keys.length < 1
    ){
        stderr.throw("missing_args");
    }

    const will_verify_message = Boolean(output_verification);
    if(will_verify_message ^ (input_verify_publickeys.length > 0)){
        // if only verify output or certs supplied: cannot perform verification
        stderr.throw("incomplete_verification");
    }

    // Read in material for decryption and verification

    const decrypt_session_keys = []; // TODO session keys!
    const decrypt_keys = await read_keys(
        input_keys, read_keys.FILTER_PRIVATE_KEY);
    const decrypt_passwords = await read_passwords(input_passwords);

    const verify_publickeys = await read_public_keys(input_verify_publickeys);

    // Read in ciphertext
    
    let message = await openpgp.message.readArmored(
        await util.stream_readall(stdin));

    // Attempt to decrypt, if message is encrypted
    
    const need_decrypt = (message.packets.filterByTag(
            enums.packet.symmetricallyEncrypted,
            enums.packet.symEncryptedIntegrityProtected,
            enums.packet.symEncryptedAEADProtected
        ).length > 0);

    if(need_decrypt){
        try{
            let result = await do_decrypt(
                message,
                decrypt_keys, decrypt_passwords, decrypt_session_keys
            );
            message = result.message;
            //io.session_key.toFile(output_session_key, result.session_keys);
        } catch(e){
            stderr.throw("cannot_decrypt");
        }
    }

    // Output decrypt results.

    stdout(await util.stream_readall(message.getLiteralData()));

    // Now verify the message, if instructed.
    
}




/**
 * Attempt to decrypt the message. Returns { message, session_key } upon
 * successful decryption.
 */
async function do_decrypt(message, keys, passwords, session_keys){
    if(!session_keys) session_keys = [];
    
    if(keys.length > 0 || passwords.length > 0){
        try{
            session_keys = session_keys.concat(
                await message.decryptSessionKeys(keys, passwords));
        } catch(e){
            throw Error("cannot_decrypt_session_key");
        }
    }

    message = await message.decrypt(
        null, // privateKeys
        null, // passwords
        session_keys
    );

    return { message, session_keys };
}
