/**
 * Read OpenPGP keys from filesystem according to a list of filenames. Apply
 * filter to keys.
 */ 

const openpgp = require("../openpgp");
const file_input = require("./file_input");

module.exports = async function read_keys(filenames, filter){
    
    const ret = [];
    for(let filename of filenames){
        const data = await file_input(filename);
        const keys = await openpgp.key.readArmored(data); // TODO read non-armored

        const key = keys.keys[0]; // ignore multiple keys within file

        if(filter !== undefined && await filter(key)) ret.push(key);
    }

    return ret;
}

module.exports.FILTER_PRIVATE_KEY = function(key){
    if(!key || !key.isPrivate()) throw Error("bad_data");
    if(!key.isDecrypted()) throw Error("key_is_protected"); // TODO Only for stateless. If stateful is allowed, remove this
    return true;
}
