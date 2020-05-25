const openpgp = require("openpgp");

require("../router").register(
    "generate-key [--no-armor] [--] [USERID...]",
    subcommand
);


async function subcommand(args, options){
    const { stdin, stdout, stderr } = options;

    const userIds = args.USERID.map((u) => { return { name: u } });

    const { privateKeyArmored, publicKeyArmored, revocationCertificate } = await openpgp.generateKey({
        userIds: userIds,
        curve: 'ed25519',
    });

    stdout(privateKeyArmored);

    // TODO noarmor option!
}
