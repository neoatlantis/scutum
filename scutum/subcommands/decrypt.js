const openpgp = require("../openpgp");
const util = require("../util");
const file_input = require("../io/file_input");

require("../router").register(
    "decrypt [--session-key-out=SESSIONKEY] [--with-session-key=SESSIONKEY...] [--with-password=PASSWORD...] [--verify-out=VERIFICATIONS [--verify-with=CERTS...] [--verify-not-before=DATE] [--verify-not-after=DATE] ] [--] [KEY...]",
    subcommand
);

async function subcommand(args, options){
    const { stdin, stdout, stderr } = options;



}
