/**
 * Read OpenPGP keys from filesystem according to a list of filenames. Apply
 * filter to keys.
 */ 

const openpgp = require("../openpgp");
const file = require("./file");

async function from_files(filenames, filter){
    const ret = [];
    for(let filename of filenames){
        const data = await file.read(filename);
        const keys = await openpgp.key.readArmored(data); // TODO read non-armored

        const key = keys.keys[0]; // ignore multiple keys within file

        if(filter !== undefined && await filter(key)) ret.push(key);
    }

    return ret;
}

async function public_from_files(filenames){
    return (await from_files(filenames, function(key){
        return (key !== undefined);
    })).map((key) => {
        // we allow private keys as input, as they can be converted to public
        if(key.isPublic()) return key;
        return key.toPublic();
    });
}

async function private_from_files(filenames, options){
    if(!options) options = {
        exclusive: true,
        require_decrypted: true,
    };

    // true: must be private key, empty or public keys not allowed
    const option_exclusive = Boolean(options.exclusive);
    const option_require_decrypted = Boolean(options.require_decrypted);

    return (await from_files(filenames, function(key){
        if(!key || !key.isPrivate()){
            if(option_exclusive)
                throw Error("bad_data");
            else
                return false;
        }
        if(!key.isDecrypted()){
            if(option_require_decrypted) throw Error("key_is_protected");
        }
        return true;
    }));
}


module.exports.from_files = from_files;
module.exports.public_from_files = public_from_files;
module.exports.private_from_files = private_from_files;
