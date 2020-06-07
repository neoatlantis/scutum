const openpgp = require("../openpgp");
const util = require("../util");
const io = require("../io");

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

    let keys = await io.keys.private_from_files(args.KEY);


    const data_to_sign = await util.stream_readall(stdin);
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
