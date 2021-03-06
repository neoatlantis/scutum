const openpgp = require("../openpgp");
const enums = openpgp.enums;
const util = require("../util");
const io = require("../io");

const read_passwords = require("../io/read_passwords");

const { read_verification, verifications_to_string }  = require("./verify");

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

    const need_verify = Boolean(output_verification);
    if(need_verify ^ (input_verify_publickeys.length > 0)){
        // if only verify output or certs supplied: cannot perform verification
        stderr.throw("incomplete_verification");
    }

    // Read in material for decryption and verification

    let decrypt_session_keys = await io.session_keys.from_file(input_session_keys);
    const decrypt_keys = await io.keys.private_from_files(input_keys);
    const decrypt_passwords = await read_passwords(input_passwords);

    const verify_publickeys = 
        await io.keys.public_from_files(input_verify_publickeys);

    // Read in ciphertext, we make 2 copies for same data, one for session key
    // decryption, the other for openpgp.verify; This is not a good solution
    // because it consumes much memory, when the input is large.
    
    let message_for_session_key, message;
    {
        const input_data = await util.stream_readall(stdin);

        message_for_session_key = await openpgp.message.readArmored(input_data);
        message = await openpgp.message.readArmored(input_data);
    }

    // Attempt to decrypt, if message is encrypted
    
    /*const need_decrypt = (message.packets.filterByTag(
            enums.packet.symmetricallyEncrypted,
            enums.packet.symEncryptedIntegrityProtected,
            enums.packet.symEncryptedAEADProtected
        ).length > 0);*/

    try{
        decrypt_session_keys = decrypt_session_keys.concat(
            await decrypt_session_key(
                message_for_session_key,
                decrypt_keys,
                decrypt_passwords
            )
        );
    } catch(e){
    }

    if(output_session_key){
        await io.session_keys.to_file(output_session_key, decrypt_session_keys);
    }

    let result;

    try{
        result = await openpgp.decrypt({
            sessionKeys: decrypt_session_keys,
            message: message,
            publicKeys: verify_publickeys,
        });
    } catch(e){
        throw Error("cannot_decrypt");
    }

    // Output decrypt results.

    stdout(result.data);

    if(need_verify){
        
        const verify_result = await read_verification(
            verify_publickeys,
            result.signatures,
            input_verify_not_before,
            input_verify_not_after
        );

        console.log(verifications_to_string(verify_result));

    }
    

}



/**
 * Call message.decryptSessionKeys separately for decryption with passwords
 * and keys. This is necessary since message.decryptSessionkeys accepted
 * arguments mutually exclusive(see OpenPGP source code), and we have to invoke
 * with both(keys + no passwords), and (no keys + passwords).
 */

async function decrypt_session_key(message, keys, passwords){
    const decryption_results = await Promise.allSettled([
        message.decryptSessionKeys(keys, undefined),
        message.decryptSessionKeys(undefined, passwords),
    ]);

    for(let decryption_result of decryption_results){
        if(undefined !== decryption_result.value){
            return decryption_result.value;
        }
    }

    throw Error("cannot_decrypt_session_key");
}
