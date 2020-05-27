const util = require("../util");

module.exports = function(e){
    if(e.readable === true){
        (async function(){
            const generator = util.stream_yieldall(e);

            while(true){
                let { done, value } = await generator.next();
                process.stdout.write(value);
                if(done) break;
            }
        })();
    } else {
        process.stdout.write(e);
    }
}
