const openpgp = require("../openpgp");
const util = require("../util");
const file_input = require("../io/file_input");

require("../router").register(
    "dearmor",
    subcommand
);

async function subcommand(args, options){
    const { stdin, stdout, stderr } = options;

    const armored_input = await util.async_iterator_stream_readall(stdin);
    const armored_input_text = armored_input.toString("utf-8");

    const dearmored = await openpgp.armor.decode(armored_input_text);

    stdout(await util.readablestream_readall(dearmored.data));
}
