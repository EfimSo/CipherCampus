#!/usr/bin/env ts-node
// compute_root_from_json.ts
// Reads full_tree.json and recomputes the Merkle root (using stored nodes + zero values).

import { BarretenbergSync, Fr } from "@aztec/bb.js";
import fs from "fs";

interface StoredTree {
  levels: number;
  zeroValue: string;
  storage: [string, string][];
}

(async () => {
  // 1) Load the JSON dump
  const raw = fs.readFileSync("full_tree.json", "utf8");
  const data: StoredTree = JSON.parse(raw);

  // 2) Init Barretenberg & reconstruct zeros[]
  await BarretenbergSync.initSingleton();
  const bb = BarretenbergSync.getSingleton();

  const zeros: Fr[] = [];
  let z = Fr.fromString(data.zeroValue);
  zeros.push(z);
  for (let i = 0; i < data.levels; i++) {
    z = bb.pedersenHash([z, z], 0);
    zeros.push(z);
  }

  // 3) Rehydrate storage map
  const storage = new Map<string, Fr>(
    data.storage.map(([key, hex]) => [key, Fr.fromString(hex)])
  );

  // 4) Compute root: look up "<levels>-0" or fallback to zeros[levels]
  const rootKey = `${data.levels}-0`;
  const root = storage.get(rootKey) ?? zeros[data.levels];

  // 5) Print
  console.log("Recomputed Merkle root:", root.toString());
})();
