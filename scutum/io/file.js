const fs = require("fs");

module.exports.read = async function(filename){
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if(err) return reject(err);
            resolve(data);
        });
    });
}

module.exports.write = async function(filename, data, mode){
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, {
            flag: mode !== undefined ? mode : "wx",
        }, (err, data) => {
            if(err) return reject(err);
            resolve(data);
        });
    });
}
