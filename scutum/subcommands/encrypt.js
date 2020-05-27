const openpgp = require("../openpgp");
const util = require("../util");
const read_keys = require("../io/read_keys");

require("../router").register(
    "encrypt [--as=binary|text|mime] [--no-armor] [--with-password=PASSWORD...] [--sign-with=KEY...] [--] [CERTS...]",
    subcommand
);





async function subcommand(args, options){
    const { stdin, stdout, stderr } = options;

    let public_keys = await read_keys(args.CERTS, async function(public_key){
        if(!(await public_key.getEncryptionKey())){
            throw Error("cert_cannot_encrypt");
        }
        return true;
    });

    let passwords;
    passwords = args["--with-password"];
    // TODO check passwords are human-readable, enforce rules
    // TODO allow passwords be fed from a file


    if(public_keys.length < 1 && passwords.length < 1){
        // as by specfication
        stderr.throw("missing_arg");
    }

    let private_keys = await read_keys(
        args["--sign-with"],
        read_keys.FILTER_PRIVATE_KEY
    );

    /*const result = (await openpgp.encrypt({
        message: openpgp.message.fromBinary(stdin),
        passwords: passwords,
        publicKeys: public_keys,
    })).data;*/


    stdout((await openpgp.encrypt({
        message: openpgp.message.fromBinary(await util.stream_readall(stdin)),
        passwords: passwords,
        publicKeys: public_keys,
        privateKeys: private_keys,
    })).data);

}
