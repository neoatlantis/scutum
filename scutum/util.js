const openpgp = require("./openpgp");


module.exports.async_iterator_stream_readall = async function(s){
    const chunks = [];

    while(true){
        let chunk = await s.next();
        if(chunk.value) chunks.push(chunk.value);
        if(chunk.done) break;
    }

    return Buffer.concat(chunks);
}


module.exports.readablestream_readall = async function (s){
    const reader = s.getReader();
    const chunks = [];

    while(true){
        let chunk = await reader.read();
        if(chunk.value) chunks.push(chunk.value);
        if(chunk.done) break;
    }

    return Buffer.concat(chunks);
}

module.exports.buffer_looks_armored = function(buf){
    // TODO do a very strict check!
    if(!Buffer.isBuffer(buf)) throw Error("Must be a buffer.");
    return ((buf[0] & 0x80) == 0 && buf[0] == 0x2D);
}


module.exports.buffer_to_packetlist = async function(buf){
    // Refer to OpenPGP.js source code for usage with openpgp.packet

    const packetlist = new openpgp.packet.List();
    await packetlist.read(buf);

    return packetlist;
}
