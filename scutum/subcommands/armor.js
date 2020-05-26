const openpgp = require("../openpgp");
const util = require("../util");

require("../router").register(
    "armor [--label=auto|sig|key|cert|message]",
    subcommand
);


/**
 * Tests if a given tag name (from CLI) matches an actual PGP packet tag.
 */
function test_tag(desired_tag_name, tag_id){
    if(!Number.isInteger(tag_id)) return false;
    if({"sig": 0x02, "key": 0x05, "cert": 0x06}[desired_tag_name] === tag_id){
        return true;
    }
    if(desired_tag_name == "message" && (tag_id == 0x01 || tag_id == 0x03)){
        return true;
    }
    return false;
}

/**
 * Translates from an PGP tag to corresponding enum entry from OpenPGP.js.
 */
function translate_tag_enum(tag_id){
    const ret = {
        0x01: openpgp.enums.armor.message,
        0x03: openpgp.enums.armor.message,
        0x02: openpgp.enums.armor.signature,
        0x05: openpgp.enums.armor.private_key,
        0x06: openpgp.enums.armor.public_key,
    }[tag_id];
    if(tag_id == undefined) throw Error("bad_data");
    return ret;
}

async function subcommand(args, options){
    const { stdin, stdout, stderr } = options;

    let input;
    try{
        input = await util.async_iterator_stream_readall(stdin);
    } catch(e){
        stderr.throw("bad_data");
    }

    if(util.buffer_looks_armored(input)){
        // dearmor it and convert data in buffer
        try{
            input = input.toString("utf-8").trim();
            input = await openpgp.armor.decode(input);
            input = await util.readablestream_readall(input.data);
        } catch(e){
            stderr.throw("bad_data");
        }
    }

    // convert buffer to packetlist

    let packetlist;
    try{
        packetlist = await util.buffer_to_packetlist(input);
    } catch(e){ 
        stderr.throw("bad_data");
    }

    // main tag: tag of the first packet in packetlist
    const main_tag = packetlist[0].tag;

    // check main tag against desired type
    const desired_tag = args["--label"]?args["--label"].toLowerCase():"auto";
    if(desired_tag != "auto" && !test_tag(desired_tag, main_tag)){
        stderr.throw("bad_data");
    }

    // if nothing happens, pass the input through
    const output_buffer = packetlist.write();
    
    stdout(await openpgp.armor.encode(
        translate_tag_enum(main_tag),
        output_buffer
    ));

}
