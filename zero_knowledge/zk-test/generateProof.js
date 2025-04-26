// generateProof.js
// ----------------
// Proof generator for two Noir circuits (with and without grade proof) entirely client-side.
// Exports generateProof(inputs, includeGrade) → Promise<Uint8Array> of SNARK proof bytes.

import { createFileManager, compile_program, execute_program } from '@noir-lang/noir_wasm';
import { UltraHonkBackend } from '@aztec/bb.js';

let _bbBackend = null;
async function _initBackend() {
  if (_bbBackend) return;
  _bbBackend = await UltraHonkBackend.new();
}

/**
 * Generate a ZK proof in-browser.
 * @param {Object} inputs - Circuit inputs:
 *   @property {string|number} skLo       - Lower limb of secret key
 *   @property {string|number} skHi       - Upper limb of secret key
 *   @property {string|number} leafIndex  - Leaf index in Merkle tree
 *   @property {string[]}       path       - Merkle path elements (hex strings)
 *   @property {string|number} pkX        - Public key x-coordinate
 *   @property {string|number} pkY        - Public key y-coordinate
 *   @property {string|number} collegeIdx - College index (public)
 *   @property {string|number} deptIdx    - Department index (public)
 *   @property {string|number} courseIdx  - Course index (public)
 *   @property {string|number} [grade]     - Grade (only if includeGrade=true)
 *   @property {string|number} [professor] - Professor ID (only if includeGrade=true)
 * @param {boolean} includeGrade - Selects with-grade (true) or without-grade (false) circuit
 * @returns {Promise<Uint8Array>} Raw proof bytes
 */
export async function generateProof(inputs, includeGrade) {
  await _initBackend();

  // 1) Fetch correct circuit source
  const circuitPath = includeGrade ?
    '/verifyWithGrade/main.nr' :
    '/verifyWithoutGrade/main.nr';
  const source = await fetch(circuitPath).then(r => {
    if (!r.ok) throw new Error(`Failed to load circuit: ${circuitPath}`);
    return r.text();
  });

  // 2) Compile circuit to ACIR in-memory
  const fm = createFileManager('/');
  await fm.writeFile('/main.nr', source);
  const { program } = await compile_program(fm);

  // 3) Build private inputs array
  const priv = [
    inputs.skLo,
    inputs.skHi,
    inputs.leafIndex,
    ...inputs.path,
    inputs.pkX,
    inputs.pkY
  ];

  // 4) Build public inputs array
  let pub;
  if (includeGrade) {
    if (inputs.grade == null || inputs.professor == null) {
      throw new Error('Both grade and professor are required when includeGrade=true');
    }
    pub = [
      inputs.grade,
      inputs.professor,
      inputs.collegeIdx,
      inputs.deptIdx,
      inputs.courseIdx
    ];
  } else {
    pub = [
      inputs.collegeIdx,
      inputs.deptIdx,
      inputs.courseIdx
    ];
  }

  // 5) Execute to obtain witness
  const { witness } = await execute_program(program, priv, pub);

  // 6) Generate proof bytes
  const proof = await _bbBackend.generateProof(witness);
  return proof;
}
