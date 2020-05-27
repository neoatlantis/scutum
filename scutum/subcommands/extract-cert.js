const openpgp = require("../openpgp");
const util = require("../util");
const read_keys = require("../io/read_keys");

require("../router").register(
    "extract-cert [--no-armor]",
    subcommand
);

async function subcommand(args, options){
    const { stdin, stdout, stderr } = options;

    const key = (await openpgp.key.readArmored(stdin)).keys[0];

    try{
        // read_keys was designed for reading from file, but its filter
        // functions can be used here.
        read_keys.FILTER_PRIVATE_KEY(key);
    } catch(e){
        stderr.throw(e);
    }

    const public_key = key.toPublic();

    // TODO move this conversion to stdout module
    if(args["--no-armor"]){
        stdout(public_key.toPacketlist().write());
    } else {
        stdout(public_key.armor());
    }
};
