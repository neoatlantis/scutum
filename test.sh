#!/bin/sh

node scutum version

node scutum generate-key abcd | node scutum extract-cert

node scutum dearmor < test/alice.public.asc | node scutum armor

node scutum encrypt --no-armor --with-password=PASSWORD --with-password=PASSWORD2 < test/plaintext.txt | node scutum decrypt --with-password=PASSWORD

node scutum encrypt --no-armor test/alice.public.asc < test/plaintext.txt | node scutum decrypt test/alice.secret.asc

node scutum decrypt --with-password=password --verify-with=test/alice.public.asc --verify-with=test/bob.public.asc --verify-out=- < test/ciphertext.password.signed.asc 


