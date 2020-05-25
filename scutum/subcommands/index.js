/**
 * Include all subcommands. Each subcommand registers itself, therefore no
 * exports needed.
 */

require("./version");
require("./generate-key");
require("./extract-cert");
require("./sign");
require("./verify");
require("./encrypt");
require("./decrypt");
require("./armor");
require("./dearmor");
require("./detach-inband-signature-and-message");


/* TODO

"verify [--not-before=DATE] [--not-after=DATE] [--] SIGNATURES CERTS [CERTS...]",
"armor [--label=auto|sig|key|cert|message]",
"detach-inband-signature-and-message --signatures-out=SIGNATURES",

*/
