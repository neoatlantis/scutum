const openpgp = require("../openpgp");
const util = require("../util");

require("../router").register(
    "extract-cert [--no-armor]",
    subcommand
);

async function subcommand(args, options){
    const { stdin, stdout, stderr } = options;

    const key = (await openpgp.key.readArmored(stdin)).keys[0];

    if(!(key && key.isPrivate())){
        stderr.throw("bad_data");
    }

    if(!key.isDecrypted()){
        stderr.throw("key_is_protected");
    }

    const public_key = key.toPublic();

    // TODO move this conversion to stdout module
    if(args["--no-armor"]){
        stdout(public_key.toPacketlist().write());
    } else {
        stdout(public_key.armor());
    }
};
