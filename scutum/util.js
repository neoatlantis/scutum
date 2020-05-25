module.exports.async_iterator_stream_readall = async function(s){
    const chunks = [];

    while(true){
        let chunk = await s.next();
        if(chunk.value) chunks.push(chunk.value);
        if(chunk.done) break;
    }

    return Buffer.concat(chunks);
}
