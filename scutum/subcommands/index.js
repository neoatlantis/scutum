/**
 * Include all subcommands. Each subcommand registers itself, therefore no
 * exports needed.
 */

// done

require("./version");
require("./generate-key");
require("./extract-cert");
require("./armor");
require("./dearmor");

// coding

require("./sign");
require("./verify");
require("./encrypt");
require("./decrypt");
require("./detach-inband-signature-and-message");


/* TODO

"detach-inband-signature-and-message --signatures-out=SIGNATURES",

*/
