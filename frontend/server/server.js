const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow frontend to access
app.use(express.json());

app.post('/run-proof', (req, res) => {
  const python = spawn('python3', ['../../zero_knowledge/circuits/verifyNoGradeNoMajor/generate_proof.py']); // adjust path as needed

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

app.listen(3002, () => console.log('Server listening on http://localhost:3002'));
