import { ACVM } from "@noir-lang/acvm_js";

/**
 * Generate a zero-knowledge proof in-browser.
 * @param {object} inputs - Circuit inputs (hex strings or numbers).
 * @param {boolean} hasGrade - Whether a grade was provided (selects circuit variant).
 * @param {boolean} hasMajor - Whether a major was provided (selects circuit variant).
 * @returns {Uint8Array} - Proof bytes ready for submission.
 */
export async function generateProof(inputs, hasGrade, hasMajor) {
  // Choose the correct circuit folder
  const circuit = hasGrade
    ? (hasMajor ? "verifyYesGradeYesMajor" : "verifyYesGradeNoMajor")
    : (hasMajor ? "verifyNoGradeYesMajor" : "verifyNoGradeNoMajor");

  // Fetch compiled artifacts & TOML
  const [acirBuf, wasmBuf, tomlStr] = await Promise.all([
    fetch(`/zk/${circuit}/${circuit}.json`).then((r) => r.json()),
    fetch(`/zk/${circuit}/${circuit}.wasm`).then((r) => r.arrayBuffer()),
    fetch(`/zk/${circuit}/Prover.toml`).then((r) => r.text()),
  ]);

  // Initialize the ACVM instance
  const wasmBytes = new Uint8Array(wasmBuf);
  const acvm = await ACVM.new(
    acirBuf,
    wasmBytes,
    tomlStr
  );

  // Run the prover
  const proof = await acvm.run(inputs);
  return proof;
}
