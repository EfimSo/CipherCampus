import { Noir } from "@noir-lang/noir_js";
import { UltraHonkBackend } from "@aztec/bb.js";
import noGradeNoMajorCircuit from "./verifyNoGradeNoMajor/verifyWithNoGradeNoMajor.json";
import noGradeYesMajorCircuit from "./verifyNoGradeYesMajor/verifyWithNoGradeYesMajor.json";
import yesGradeNoMajorCircuit from "./verifyYesGradeNoMajor/verifyWithYesGradeNoMajor.json";
import yesGradeYesMajorCircuit from "./verifyYesGradeYesMajor/verifyWithYesGradeYesMajor.json";


// Map each variant to its JSON bundle
const circuits = {
  verifyNoGradeNoMajor: noGradeNoMajorCircuit,
  verifyNoGradeYesMajor: noGradeYesMajorCircuit,
  verifyYesGradeNoMajor: yesGradeNoMajorCircuit,
  verifyYesGradeYesMajor: yesGradeYesMajorCircuit,
};

/**
 * Generate a zero-knowledge proof using Noir and UltraHonk.
 * @param {object} inputs
 * @param {boolean} hasGrade
 * @param {boolean} hasMajor
 */
export async function generateProof(inputs, hasGrade, hasMajor) {

  const key = hasGrade
    ? (hasMajor ? "verifyYesGradeYesMajor" : "verifyYesGradeNoMajor")
    : (hasMajor ? "verifyNoGradeYesMajor" : "verifyNoGradeNoMajor");
  console.log("Selected circuit:", key);
  const bundle = circuits[key];
  console.log("Circuit bundle:", bundle);
  // 1) Execute circuit to get witness
  const noir = new Noir(bundle);
  const backend = new UltraHonkBackend(bundle.bytecode);
  console.log("Noir instance:", noir);
  console.log("inputs", inputs);
  const { witness } = await noir.execute(inputs);

  console.log("Witness:", witness);
  // 2) Generate proof with UltraHonk
  //const backend = new UltraHonkBackend(bundle.bytecode);
  //return backend.prove(witness);
  return backend.generateProof(witness);
}
