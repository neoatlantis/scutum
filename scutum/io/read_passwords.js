/**
 * Read and interprete a list of passwords. Optionally apply rules on
 * passwords, so that only a limited subset may be accepted.
 */

module.exports = function read_passwords(inputs, rules){
    // TODO allow passwords be fed from a file, e.g. for each input allow
    // access to filesystem for password
    return inputs.filter((input) => (rules === undefined || rules(input)));
}

/**
 * Human readable ASCII subset, all printable characters.
 */
module.exports.RULE_HUMAN_READABLE = function(password){
    return /^[\x20-\x7e]+$/.test(password);
}
