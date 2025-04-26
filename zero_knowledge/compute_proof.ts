#!/usr/bin/env ts-node
// compute_proof.ts
// Finds the index and Merkle proof for a specific row, verifies against the expected root,
// and outputs the associated prover.toml entries for that row only.

import { BarretenbergSync, Fr } from "@aztec/bb.js";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

// Base directory for data files
const BASE_DIR = process.cwd();
const KEYPAIRS_FILE = path.join(BASE_DIR, "grumpkin_keygen", "grumpkin_keypairs.json");
const FULL_TREE_FILE = path.join(BASE_DIR, "full_tree.json");
const CSV_FILE = path.join(BASE_DIR, "courses_assigned.csv");

// Helper: bigint → 32-byte Fr
function toFr(n: bigint): Fr {
  return Fr.fromString("0x" + n.toString(16).padStart(64, "0"));
}

// Lookup tables
const PROFESSORS = [
  "Dr. Alice Smith", "Dr. Bob Johnson", "Dr. Carol Williams", "Dr. David Brown",
  "Dr. Emma Davis", "Dr. Frank Miller", "Dr. Grace Wilson", "Dr. Henry Moore"
];
const GRADES = ["F", "D", "C-", "C", "C+", "B-", "B", "B+", "A-", "A"];
const PROFESSOR_CODES: Record<string, bigint> = Object.fromEntries(
  PROFESSORS.map((name, idx) => [name, BigInt(idx)])
);
const GRADE_CODES: Record<string, bigint> = Object.fromEntries(
  GRADES.map((grade, idx) => [grade, BigInt(idx)])
);

// Expected root
const EXPECTED_ROOT =
  "0x283194be2300cf497ddcafcec2938eb2acd67b10df5fc03ce5401b9d62448b95";

// Types
interface StoredTree {
  levels: number;
  zeroValue: string;
  storage: [string, string][];
}
interface KeyPair { sk_lo: string; sk_hi: string; pk_x: string; pk_y: string; }

// Load keypairs
let keypairs: KeyPair[];
try {
  keypairs = JSON.parse(fs.readFileSync(KEYPAIRS_FILE, "utf8"));
} catch (e:any) {
  console.error("Failed to load keypairs:", e.message || e);
  process.exit(1);
}

// Sparse Merkle tree
class MerkleTree {
  zeroValue: Fr;
  levels: number;
  zeros: Fr[] = [];
  storage: Map<string, Fr> = new Map();
  bb!: BarretenbergSync;

  constructor(levels: number, zeroValueHex: string) {
    this.levels = levels;
    this.zeroValue = Fr.fromString(zeroValueHex);
  }

  async init() {
    await BarretenbergSync.initSingleton();
    this.bb = BarretenbergSync.getSingleton();
    let cur = this.zeroValue;
    this.zeros = [cur];
    for (let i = 0; i < this.levels; i++) {
      cur = this.bb.pedersenHash([cur, cur], 0);
      this.zeros.push(cur);
    }
  }

  insertStorage(storageEntries: [string, string][]) {
    for (const [k, v] of storageEntries) {
      this.storage.set(k, Fr.fromString(v));
    }
  }

  proof(index: number) {
    const pathElements: Fr[] = [];
    const pathIndices: number[] = [];
    let curIdx = index;
    for (let lvl = 0; lvl < this.levels; lvl++) {
      const siblingIdx = curIdx ^ 1;
      const sibling = this.storage.get(`${lvl}-${siblingIdx}`) ?? this.zeros[lvl];
      pathElements.push(sibling);
      pathIndices.push(curIdx & 1);
      curIdx >>= 1;
    }
    const root = this.storage.get(`${this.levels}-0`) ?? this.zeros[this.levels];
    const leaf = this.storage.get(`0-${index}`) ?? this.zeros[0];
    return { root, pathElements, pathIndices, leaf };
  }
}

// Index packing constants
const COURSE_FIXED: Record<string, bigint> = {"101":0n,"102":1n,"201":2n,"202":3n,"301":4n,"302":5n,"595":6n};
const COLLEGE_MULT = 1n << 15n;
const DEPT_MULT    = 1n << 12n;
const COURSE_MULT  = 1n <<  9n;

(async () => {
  // Load tree
  let full: StoredTree;
  try {
    full = JSON.parse(fs.readFileSync(FULL_TREE_FILE, "utf8"));
  } catch (e:any) {
    console.error("Failed to load Merkle tree:", e.message || e);
    process.exit(1);
  }
  const tree = new MerkleTree(full.levels, full.zeroValue);
  await tree.init();
  tree.insertStorage(full.storage);

  // Read CSV
  const rows = parse(fs.readFileSync(CSV_FILE, "utf8"), { columns: true, skip_empty_lines: true }) as any[];

  // Target row
  const target = rows.find(r =>
    r.college === "ENG" &&
    r.department === "Mechanical Engineering" &&
    r.course_number === "301" &&
    r.pk_x === "0x043109d503c77ce74afa15de64ff93b159acf8a06fea97a079f387d75adf8650" &&
    r.pk_y === "0x1f1628c9f05d3f90f8a2f05c2fd88da4cc10ac7d772e6fe4fbb54e322fd74499" &&
    r.professor === "Dr. Emma Davis" &&
    r.grade === "B"
  );
  if (!target) {
    console.error("Target row not found.");
    process.exit(1);
  }

  // Compute leafIndex
  const collegeMap = new Map<string, bigint>();
  const deptMap    = new Map<string, bigint>();
  const studentMap = new Map<string, bigint>();
  let leafIndex = 0n;
  for (const r of rows) {
    if (!collegeMap.has(r.college)) collegeMap.set(r.college, BigInt(collegeMap.size));
    const c = collegeMap.get(r.college)!;
    const deptKey = `${r.college}|${r.department}`;
    if (!deptMap.has(deptKey)) deptMap.set(deptKey, BigInt([...deptMap.keys()].filter(k=>k.startsWith(`${r.college}|`)).length));
    const d = deptMap.get(deptKey)!;
    const k = COURSE_FIXED[r.course_number];
    const studentKey = `${deptKey}|${r.course_number}|${r.pk_x}|${r.pk_y}|${r.professor}|${r.grade}`;
    if (!studentMap.has(studentKey)) studentMap.set(studentKey, BigInt([...studentMap.keys()].filter(k=>k.startsWith(`${deptKey}|${r.course_number}|`)).length));
    const s = studentMap.get(studentKey)!;
    const idx = c*COLLEGE_MULT + d*DEPT_MULT + k*COURSE_MULT + s;
    if (r === target) { leafIndex = idx; break; }
  }

  // Find keypair
  const kp = keypairs.find(kp=> kp.pk_x===target.pk_x && kp.pk_y===target.pk_y)!;

  // Compute proof
  const { root, pathElements, pathIndices, leaf } = tree.proof(Number(leafIndex));

  // Output prover.toml
  console.log(`college_idx   = "${collegeMap.get(target.college)}"`);
  console.log(`course_idx    = "${COURSE_FIXED[target.course_number]}"`);
  console.log(`dept_idx      = "${deptMap.get(`${target.college}|${target.department}`)}"`);
  console.log(`grade         = "${target.grade}"`);
  console.log(`leaf_index    = "${leafIndex}"`);
  console.log(`path          = [${pathElements.map(e=>`"${e.toString()}"`).join(", ")}]
`);
  console.log(`pk_x          = "${target.pk_x}"`);
  console.log(`pk_y          = "${target.pk_y}"`);
  console.log(`professor     = "${target.professor}"`);
  console.log(`sk_lo         = "${kp.sk_lo}"`);
  console.log(`sk_hi         = "${kp.sk_hi}"`);
  console.log(`computed_root = "${root.toString()}"`);
  console.log(`expected_root = "${EXPECTED_ROOT}"`);
  console.log(`valid         = ${root.toString()===EXPECTED_ROOT}`);
})();
