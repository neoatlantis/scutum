module.exports.throw = function(e){
    if(typeof process != "undefined"){
        e = e.toUpperCase();
        if(e != "OK"){
            process.stderr.write(e + "\n");
            process.exit(1); // TODO
        }
        process.exit(0);
    }
    throw Error(e);
};
