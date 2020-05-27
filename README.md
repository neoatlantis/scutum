scutum
======

`scutum`(Latin: shield) is a command line PGP tool running on NodeJS and
powered by OpenPGP.js. As designed with a stateless style of usage, it should
be friendly for both human and machines to undertake basic PGP operations, like
generating public & private keys, encrypting-, ~decrypting-~(not yet), signing-
and verifying messages. 

This tool is still under busy development, and much of its features must be
refined to have a consistent behaviour with [specification][SPEC]. It's also
planned to make a stateful version for more features named `scuta`, but no code
written yet.





\[specification\]: [Stateless OpenPGP Command Line Interface][SPEC]

[[SPEC]]: https://tools.ietf.org/html/draft-dkg-openpgp-stateless-cli-02
