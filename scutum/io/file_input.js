const fs = require("fs");

module.exports = async function(filename){
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if(err) return reject(err);
            resolve(data);
        });
    });
}
