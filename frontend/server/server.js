const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow frontend to access
app.use(express.json());

app.post('/run-proof', (req, res) => {
  const {
    leaf_index,
    path,
    pk_x,
    pk_y,
    sk_lo,
    sk_hi,
    professor,
    grade,
    major,
    college_idx,
    dept_idx,
    course_idx,
    include_grade,
    include_major
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
    '--pk_x',        pk_x,
    '--pk_y',        pk_y,
    '--sk_lo',       sk_lo,
    '--sk_hi',       sk_hi,
    '--professor',   professor,
    '--grade',       grade,
    '--major',       major,
    '--college_idx', college_idx,
    '--dept_idx',    dept_idx,
    '--course_idx',  course_idx,
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

app.listen(3002, () => console.log('Server listening on http://localhost:3002'));
