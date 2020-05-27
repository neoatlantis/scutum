const openpgp = require("../openpgp");
const util = require("../util");
const read_keys = require("../io/read_keys");
const read_passwords = require("../io/read_passwords");

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
    passwords = read_passwords(args["--with-password"], function(password){
        if(!read_passwords.RULE_HUMAN_READABLE(password)){
            stderr.throw("password_not_human_readable");
        }
        return true;
    });


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

    const input_parser = (
        args["--as"] == "text" ?
        openpgp.message.fromBinary : openpgp.message.fromText
    ); // TODO validate text as UTF-8

    stdout((await openpgp.encrypt({
        message: input_parser(await util.stream_readall(stdin)),
        passwords: passwords,
        publicKeys: public_keys,
        privateKeys: private_keys,
    })).data);

}
