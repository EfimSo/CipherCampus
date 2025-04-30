import { Noir } from "@noir-lang/noir_js";
import { UltraHonkBackend } from "@aztec/bb.js";

import sampleCircuit from "./sampleCircuit/circuit.json";




export async function generateSampleProof() {

  const noir = new Noir(sampleCircuit);
  const backend = new UltraHonkBackend(sampleCircuit.bytecode);
  console.log("Noir instance:", noir);
  const { witness } = await noir.execute({age: 18});

  console.log("Witness:", witness);
  // 2) Generate proof with UltraHonk
  //const backend = new UltraHonkBackend(bundle.bytecode);
  //return backend.prove(witness);
  return backend.generateProof(witness);
}
