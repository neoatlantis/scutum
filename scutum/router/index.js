const { stdin, stdout, stderr } = require("../stdio");

const docopt = require("docopt").docopt;
const usages = {};

function register(usage, handler){
    usages[usage] = {
        verb: /^([a-z\-]+)\s?/i.exec(usage)[1].toLowerCase(),
        handler: handler,
    };
}

module.exports = function(args, options){
    let doc = "Usage:\n";
    for(let usage of Object.keys(usages)){
        doc += " scutum " + usage + "\n";
    }

    const parsed_args = docopt(doc, { argv: args });

    for(let [usage, {verb, handler}] of Object.entries(usages)){
        if(parsed_args[verb] === true){
            return handler(parsed_args, options);
        }
    }

    stderr.throw("undefined-usage");
}

module.exports.register = register;

