const openpgp = require("../openpgp");
const util = require("../util");
const file_input = require("../io/file_input");

require("../router").register(
    "encrypt [--as=binary|text|mime] [--no-armor] [--with-password=PASSWORD...] [--sign-with=KEY...] [--] [CERTS...]",
    subcommand
);

async function subcommand(args, options){
    const { stdin, stdout, stderr } = options;



}
