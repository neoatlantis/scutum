/**
 * An async generator yielding bytes from STDIN.
 */



async function* stdin_reader(){
    for await (const chunk of process.stdin){
        yield chunk;
    }
}

module.exports = stdin_reader;
