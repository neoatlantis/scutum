const read_keys = require("./read_keys");
module.exports = async function read_public_keys(inputs){
    return (await read_keys(inputs, function(key){
        return (key !== undefined);
    })).map((key) => {
        // we allow private keys as input, as they can be converted to public
        if(key.isPublic()) return key;
        return key.toPublic();
    });
}
