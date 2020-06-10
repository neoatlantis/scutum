require("../router").register(
    "version",
    subcommand
);

async function subcommand(args, options){
    const { stdin, stdout, stderr } = options;
    stdout("scutum 0.0.2\n");
}


