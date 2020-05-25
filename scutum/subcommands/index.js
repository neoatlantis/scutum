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

"sign [--no-armor] [--as=binary|text] [--] KEY [KEY...]",
"verify [--not-before=DATE] [--not-after=DATE] [--] SIGNATURES CERTS [CERTS...]",
"encrypt [--as=binary|text|mime] [--no-armor] [--with-password=PASSWORD...] [--sign-with=KEY...] [--] [CERTS...]",
"decrypt [--session-key-out=SESSIONKEY] [--with-session-key=SESSIONKEY...] [--with-password=PASSWORD...] [--verify-out=VERIFICATIONS [--verify-with=CERTS...] [--verify-not-before=DATE] [--verify-not-after=DATE] ] [--] [KEY...]",
"armor [--label=auto|sig|key|cert|message]",
"dearmor",
"detach-inband-signature-and-message --signatures-out=SIGNATURES",

*/
