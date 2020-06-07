const openpgp = require("../openpgp");
const file = require("./file");

module.exports = async function(filenames, filter){
    const ret = [];
    for(let filename of filenames){
        const data = await file.read(filename);
        const signature = await openpgp.signature.readArmored(data); // TODO read non-armored

        // It seems openpgp.js does not verify whether it's really a signature
        // packet. We want single detached signature, thus must skip those
        // not in this type.
        if(signature.packets[0].tag != 0x02){
            if(filter !== undefined) filter(); // report an invalid input
            continue;
        }

        if(filter === undefined || filter(signature) === true){
            ret.push(signature);
        }
    }

    return ret;

}
