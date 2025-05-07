const fs = require("fs");
const crypto = require("crypto");

// Replace this with your actual PEM private key
const privateKey = fs.readFileSync('private-key.pem', 'utf8');

// The message you want to sign
const message = "This is the message to sign";

// Create a signer using ECDSA with SHA256
const sign = crypto.createSign('SHA256');

// Update the signer with the message
sign.update(message);
sign.end();

// Generate the signature using the private key
const signature = sign.sign(privateKey, 'hex');

// Output the signature
console.log("Signature:", signature);
