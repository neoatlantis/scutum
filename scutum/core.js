/**
 * Start a new handler for a specific task. 
 *
 * @param {string[]} - CLI arguments to call for this task.
 *
 * @return [worker, stdout]
 */

const { stdin, stdout, stderr }  = require("./io");

const subcommands = require("./subcommands");
const router = require("./router");


async function scutum(cli_arguments, options){
    
    await router(cli_arguments, {
        stdin: (options && options.stdin ? options.stdin : stdin),
        stdout: stdout,
        stderr: stderr,
    });
    
}


module.exports = scutum;
