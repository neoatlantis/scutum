const openpgp = require("./openpgp");

module.exports.stream_yieldall = async function*(s){
    if(s.getReader !== undefined){ // Web API ReadableStream
        const reader = s.getReader();
        while(true){
            let chunk = await reader.read();
            if(chunk.value) yield chunk.value;
            if(chunk.done) break;
        }
    } else {
        for await (const chunk of process.stdin){
            yield chunk;
        }
    }
}


module.exports.stream_readall = async function(s){
    const chunks = [];
    const g = module.exports.stream_yieldall(s);
    while(true){
        let { done, value } = await g.next();
        if(value) chunks.push(value);
        if(done) break;
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
