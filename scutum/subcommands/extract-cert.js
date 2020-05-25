const openpgp = require("openpgp");
const util = require("../util");

module.exports = async function(args, options){
    const { stdin, stdout, stderr } = options;

    const input_buffer = await util.async_iterator_stream_readall(stdin);

    const key = (await openpgp.key.readArmored(input_buffer)).keys[0];

    if(!key.isPrivate()){
        stderr.throw("bad_data");
    }

    if(!key.isDecrypted()){
        stderr.throw("key_is_protected");
    }

    const public_key = key.toPublic();
    
    stdout(public_key.armor());
};
