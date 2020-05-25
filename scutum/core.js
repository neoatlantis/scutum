/**
 * Start a new handler for a specific task. 
 *
 * @param {string[]} - CLI arguments to call for this task.
 *
 * @return [worker, stdout]
 */

const { stdin, stdout, stderr }  = require("./stdio");
const router = require("./router");
const register = router.register;


[
    "version",
    "generate-key [--no-armor] [--] [USERID...]",
    "extract-cert [--no-armor]",
    "sign [--no-armor] [--as=binary|text] [--] KEY [KEY...]",
    "verify [--not-before=DATE] [--not-after=DATE] [--] SIGNATURES CERTS [CERTS...]",
    "encrypt [--as=binary|text|mime] [--no-armor] [--with-password=PASSWORD...] [--sign-with=KEY...] [--] [CERTS...]",
    "decrypt [--session-key-out=SESSIONKEY] [--with-session-key=SESSIONKEY...] [--with-password=PASSWORD...] [--verify-out=VERIFICATIONS [--verify-with=CERTS...] [--verify-not-before=DATE] [--verify-not-after=DATE] ] [--] [KEY...]",
    "armor [--label=auto|sig|key|cert|message]",
    "dearmor",
    "detach-inband-signature-and-message --signatures-out=SIGNATURES",

].forEach((usage) => {
    const verb = usage.split(" ")[0];
    router.register(usage, require("./subcommands/" + verb));
});




async function scutum(cli_arguments, options){
    
    await router(cli_arguments, {
        stdin: (options && options.stdin ? options.stdin : stdin()),
        stdout: stdout,
        stderr: stderr,
    });
    

}


module.exports = scutum;
