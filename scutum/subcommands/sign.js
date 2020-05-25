const openpgp = require("../openpgp");
const util = require("../util");
const file_input = require("../io/file_input");

require("../router").register(
    "sign [--no-armor] [--as=binary|text] [--] KEY [KEY...]",
    subcommand
);

async function subcommand(args, options){
    const { stdin, stdout, stderr } = options;

    let format = args["--as"];
    if(!format) format = "binary";

    if(["binary", "text"].indexOf(format) < 0){
        stderr.throw("bad_command"); // TODO improve CLI parser and fix this need
    }

    if(format == "text") stderr.throw("FIXME: TEXT NOT SUPPORTED."); // TODO

    let keys = [];
    for(let key_filename of args.KEY){
        const key_data = await file_input(key_filename);
        let key = await openpgp.key.readArmored(key_data); // TODO check if not armored

        if(!key){
            stderr.throw("bad_data");
        }

        key = key.keys[0];

        if(!key.isPrivate()){
            stderr.throw("bad_data");
        }

        if(!key.isDecrypted()){
            stderr.throw("key_is_protected");
        }

        keys.push(key);
    }


    const data_to_sign = await util.async_iterator_stream_readall(stdin);
    // TODO ReadableStream

    let input_parser = (format == "binary" ? 
        openpgp.message.fromBinary : openpgp.message.fromText);




    const { signature: signature } = await openpgp.sign({
        message: input_parser(data_to_sign),
        privateKeys: keys,                            // for signing
        detached: true
    });


    stdout(signature);
}
