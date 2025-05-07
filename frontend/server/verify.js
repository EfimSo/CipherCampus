const { ec: EC } = require("elliptic");
const crypto = require("crypto");

const ec = new EC("secp256k1");

// Your actual values
/*
const message = "jijijiiji";
const pkX = "0x043109d503c77ce74afa15de64ff93b159acf8a06fea97a079f387d75adf8650".replace(/^0x/, "");
const pkY = "0x1f1628c9f05d3f90f8a2f05c2fd88da4cc10ac7d772e6fe4fbb54e322fd74499".replace(/^0x/, "");
const signatureHex = "30440220746838523803d2efa57842060f68d76923751f90ed4dcebe6bbd237e1dde5eb9022030fa4230a2534151cc5ea3277ff7a1eeb901ca494e4b5a2bae414e5e30af72b3";
*/

const message = "jijijiiji";
const pkX = "aeb4b6f3af00bbdaf3c3434f1d0330b1ee44c4ce1249f9a8a630551178a5987e".replace(/^0x/, "");
const pkY = "ce92f83d0da0bfe34572912240e0c1ef854bef30e1dbcf0c364b10f425ec7c4".replace(/^0x/, "");
const signatureHex = "30450220654ff0b0b4bd33df5b322ab3e59dec9e5a2045a1e36e94d865b719860c52de4902210096cfa2612e120bba8d3e4b5d50000549660792d8d7d890ae39b3b4da81def70d";
// Hash the message with SHA-256
const msgHash = crypto.createHash("sha256").update(message).digest();

// Rebuild the public key
const key = ec.keyFromPublic({ x: pkX, y: pkY }, "hex");

// Verify the signature
const isValid = key.verify(msgHash, signatureHex);

console.log(" Signature valid?", isValid);
