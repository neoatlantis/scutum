const openpgp = require("../openpgp");
const util = require("../util");

require("../router").register(
    "verify [--not-before=DATE] [--not-after=DATE] [--] SIGNATURES CERTS [CERTS...]",
    subcommand
);

async function subcommand(args, options){
    const { stdin, stdout, stderr } = options;

}
