const express = require('express');
const { createSign } = require("crypto");
const { spawn } = require('child_process');
const cors = require('cors');

const { ec: EC } = require("elliptic");
const ec = new EC("secp256k1");
const crypto = require("crypto");

const app = express();
app.use(cors()); // Allow frontend to access
app.use(express.json());

app.post('/run-proof', (req, res) => {
  const {
    leaf_index,
    path,
    pk_x_hi,
    pk_x_lo,
    pk_y_hi,
    pk_y_lo,
    professor,
    grade,
    major,
    college_idx,
    dept_idx,
    course_idx,
    include_grade,
    include_major,
    root
  } = req.body;

  // Select the appropriate proof-generation script based on provided flags
  let script = 'verifyNoGradeNoMajor';
  if (include_grade && include_major) script = 'verifyYesGradeYesMajor';
  else if (include_grade) script = 'verifyYesGradeNoMajor';
  else if (include_major) script = 'verifyNoGradeYesMajor';
  const args = [
    `../../zero_knowledge/circuits/${script}/generate_proof.py`,
    '--leaf_index',  leaf_index,
    '--path',        ...path,           
    '--pk_x_hi',     pk_x_hi,
    '--pk_x_lo',     pk_x_lo,
    '--pk_y_hi',     pk_y_hi,
    '--pk_y_lo',     pk_y_lo,
    '--professor',   professor,
    '--grade',       grade,
    '--major',       major,
    '--college_idx', college_idx,
    '--dept_idx',    dept_idx,
    '--course_idx',  course_idx,
    '--root',        root
  ];

  // Launch Python with all flags
  const python = spawn('python3', args);

  let result = '';
  python.stdout.on('data', (data) => {
    result += data.toString();
  });

  python.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  python.on('close', (code) => {
    console.log(`Python script exited with code ${code}`);
    res.json({ proof: result.trim() });
  });
});



app.post("/sign-review", (req, res) => {
  let { message, sk } = req.body;

  if (!message || !sk) {
    return res.status(400).json({ error: "Missing message or sk" });
  }

  // Convert the sk into a proper PEM format
  const formattedSK = sk.replace(/ /g, "\n");

  // Wrap with PEM headers
  const privateKeyPEM = `-----BEGIN PRIVATE KEY-----\n${formattedSK}\n-----END PRIVATE KEY-----`;

  console.log("Private key:", privateKeyPEM);

  try {
    // Create a signer using ECDSA with SHA256
    const sign = crypto.createSign('SHA256');

    // Update the signer with the message
    sign.update(message);
    sign.end();

    // Generate the signature using the private key
    const signature = sign.sign(privateKeyPEM, 'hex');

    // Return the signature
    res.json({ signature });
  } catch (err) {
    console.error("Signing error:", err);
    res.status(500).json({ error: "Failed to sign message" });
  }
});

app.listen(3002, () => console.log('Server listening on http://localhost:3002'));
