const openpgp = require("../openpgp");
const util = require("../util");

require("../router").register(
    "dearmor",
    subcommand
);

async function subcommand(args, options){
    const { stdin, stdout, stderr } = options;

    const input = await util.async_iterator_stream_readall(stdin);
    let dearmored;

    if(util.buffer_looks_armored(input)){
        try{
            const armored_input_text = input.toString("utf-8");
            dearmored = await openpgp.armor.decode(armored_input_text);
            stdout(await util.readablestream_readall(dearmored.data));
        } catch(e){
            stderr.throw("bad_data");
        }
    } else {
        let packetlist;
        try{
            packetlist = await util.buffer_to_packetlist(input);
        } catch(e){ 
            stderr.throw("bad_data");
        }
        // if nothing happens, pass the input through
        stdout(input);
    }

}
