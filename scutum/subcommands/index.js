/**
 * Include all subcommands. Each subcommand registers itself, therefore no
 * exports needed.
 */

// done

require("./version");
require("./generate-key");
require("./extract-cert");
require("./dearmor");

// coding

require("./sign");
require("./verify");
require("./encrypt");
require("./decrypt");
require("./armor");
require("./detach-inband-signature-and-message");


/* TODO

"verify [--not-before=DATE] [--not-after=DATE] [--] SIGNATURES CERTS [CERTS...]",
"detach-inband-signature-and-message --signatures-out=SIGNATURES",

*/
