// sign.js
const { ec: EC } = require("elliptic");
const crypto = require("crypto");

const ec = new EC("secp256k1");

// Reconstruct the private key
const skLo = "00d0851a3b1d23ac235650bdca139b80";
const skHi = "1e99271c61d584811f9d008865f66d99";
const privateKeyHex = skHi + skLo;

// Message to sign
const message = "jijijiiji";

// Create ECDSA key object
const key = ec.keyFromPrivate(privateKeyHex, "hex");

// Hash the message
const msgHash = crypto.createHash("sha256").update(message).digest();

// Sign it
const signature = key.sign(msgHash);
const derSignatureHex = signature.toDER("hex");

// Get public key
const pubKey = key.getPublic();
const pkX = pubKey.getX().toString("hex");
const pkY = pubKey.getY().toString("hex");

// Output all values
console.log("Message:", message);
console.log("Private key:", privateKeyHex);
console.log("Public key X:", pkX);
console.log("Public key Y:", pkY);
console.log("Signature (DER):", derSignatureHex);
