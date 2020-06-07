const openpgp = require("../openpgp");
const file = require("./file");


function session_key_to_notation(obj){
    const key_type = openpgp.enums.symmetric[obj.algorithm];
    const key_value = Buffer.from(obj.data).toString("hex").toUpperCase();
    if(key_type === undefined) throw Error("session_key_type_unknown");
    return key_type + ":" + key_value;
}

function notation_to_session_key(str){
    const parts = /^(\d+):([0-9a-f]+)$/i.exec(str.trim());
    if(!parts) throw Error("bad_data");
    try{
        const key_type_num = parts[1];
        const key_value = Buffer.from(parts[2], "hex");
        let key_type = null;
        for(key_type of Object.keys(openpgp.enums.symmetric)){
            if(openpgp.enums.symmetric[key_type] == key_type_num) break;
        }
        if(!key_type) throw Error("session_key_type_unknown");

        return { data: new Uint8Array(key_value), algorithm: key_type };
    } catch(e){
        throw Error(e);
    }
}


/**
 * Reads one or more session keys from one or more input files. Each file
 * contains per line a session key in GnuPG notation. If any line cannot be
 * parsed, skip it.
 */
module.exports.from_file = async function(filenames){
    const ret = [];
    for(let filename of filenames){
        (await file.read(filename)).toString().split("\n").forEach(l => {
            try{
                ret.push(notation_to_session_key(l));
            } catch(e){
            }
        });
    }
    return ret;
}



/**
 * Writes one or more session keys to a given file. If multiple keys are to be
 * written, write them one per line. Each key is represented in GnuPG notation.
 */
module.exports.to_file = async function(filename, session_keys){
    const writedata = session_keys.map(session_key_to_notation).join("\n");
    await file.write(filename, writedata);
}
