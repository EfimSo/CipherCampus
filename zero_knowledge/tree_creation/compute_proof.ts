#!/usr/bin/env ts-node
// compute_proof.ts
// Reads the first row from courses_assigned.csv, computes its Merkle proof,
// and prints a prover.toml snippet for that row (including major).

import { BarretenbergSync, Fr } from "@aztec/bb.js";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

// Base directory for data files
const BASE_DIR        = process.cwd();
const FULL_TREE_FILE  = path.join(BASE_DIR, "/zero_knowledge/tree_creation/full_tree.json");
const CSV_FILE        = path.join(BASE_DIR, "/zero_knowledge/tree_creation/courses_assigned.csv");

// Helper: bigint → 32-byte Fr
function toFr(n: bigint): Fr {
  return Fr.fromString("0x" + n.toString(16).padStart(64, "0"));
}

// Lookup tables
const PROFESSORS = [
  "Dr. Alice Smith","Dr. Bob Johnson","Dr. Carol Williams","Dr. David Brown",
  "Dr. Emma Davis",  "Dr. Frank Miller","Dr. Grace Wilson","Dr. Henry Moore",
];
const GRADES = ["F","D","C-","C","C+","B-","B","B+","A-","A"];

const PROFESSOR_CODES: Record<string, bigint> = Object.fromEntries(
  PROFESSORS.map((name, idx) => [name, BigInt(idx)])
);
const GRADE_CODES: Record<string, bigint> = Object.fromEntries(
  GRADES.map((g, idx) => [g, BigInt(idx)])
);

// Expected root (update if needed)
const EXPECTED_ROOT =
  "0x04c904ec344f5d4b7c6dd0f82605c7aa698f8775feb2238ac48903378159c5a3";

interface StoredTree {
  levels: number;
  zeroValue: string;
  storage: [string, string][];
}

// Sparse Merkle tree class
class MerkleTree {
  zeroValue: Fr;
  levels: number;
  zeros: Fr[] = [];
  storage = new Map<string, Fr>();
  bb!: BarretenbergSync;

  constructor(levels: number, zeroValueHex: string) {
    this.levels   = levels;
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

  insertStorage(entries: [string, string][]) {
    for (const [k, v] of entries) {
      this.storage.set(k, Fr.fromString(v));
    }
  }

  proof(index: number) {
    const pathElements: Fr[] = [];
    const pathIndices: number[] = [];
    let curIdx = index;
    for (let lvl = 0; lvl < this.levels; lvl++) {
      const sibIdx = curIdx ^ 1;
      const sib = this.storage.get(`${lvl}-${sibIdx}`) ?? this.zeros[lvl];
      pathElements.push(sib);
      pathIndices.push(curIdx & 1);
      curIdx >>= 1;
    }
    const root = this.storage.get(`${this.levels}-0`) ?? this.zeros[this.levels];
    const leaf = this.storage.get(`0-${index}`) ?? this.zeros[0];
    return { root, pathElements, pathIndices, leaf };
  }
}

// Index packing constants
const COURSE_FIXED: Record<string, bigint> = {
  "101": 0n, "102": 1n, "201": 2n, "202": 3n,
  "301": 4n, "302": 5n, "595": 6n
};
const COLLEGE_MULT = 1n << 15n;
const DEPT_MULT    = 1n << 12n;
const COURSE_MULT  = 1n <<  9n;

interface Row {
  college: string;
  department: string;
  course_number: string;
  pk_x_hi: string;
  pk_x_lo: string;
  pk_y_hi: string;
  pk_y_lo: string;
  professor: string;
  grade: string;
  major: string;
}

(async () => {
  // 1) Load Merkle tree from JSON
  let full: StoredTree;
  try {
    full = JSON.parse(fs.readFileSync(FULL_TREE_FILE, "utf8"));
  } catch (e: any) {
    console.error("Failed to load Merkle tree:", e.message);
    process.exit(1);
  }
  const tree = new MerkleTree(full.levels, full.zeroValue);
  await tree.init();
  tree.insertStorage(full.storage);

  // 2) Load CSV and pick first row
  const rows = parse(fs.readFileSync(CSV_FILE, "utf8"), { columns: true, skip_empty_lines: true }) as Row[];
  const target = rows[0];

  // 3) Build index maps and compute leafIndex for that first row
  const collegeMap = new Map<string, bigint>();
  const deptMap    = new Map<string, bigint>();
  const majorMap   = new Map<string, bigint>();
  const studentMap = new Map<string, bigint>();

  let leafIndex = 0n;
  for (const r of rows) {
    // college
    if (!collegeMap.has(r.college)) collegeMap.set(r.college, BigInt(collegeMap.size));
    const c = collegeMap.get(r.college)!;

    // department
    const deptKey = `${r.college}|${r.department}`;
    if (!deptMap.has(deptKey)) {
      deptMap.set(
        deptKey,
        BigInt([...deptMap.keys()].filter(k => k.startsWith(`${r.college}|`)).length)
      );
    }
    const d = deptMap.get(deptKey)!;

    // major
    const majKey = `${r.college}|${r.major}`;
    if (!majorMap.has(majKey)) {
      majorMap.set(
        majKey,
        BigInt([...majorMap.keys()].filter(k => k.startsWith(`${r.college}|`)).length)
      );
    }
    const m = majorMap.get(majKey)!;

    // course
    const k = COURSE_FIXED[r.course_number]!;

    // student (unique per course+major)
    const studentKey = `${deptKey}|${r.course_number}|${r.pk_x_hi}|${r.pk_x_lo}|${r.pk_y_hi}|${r.pk_y_lo}|${r.professor}|${r.grade}|${r.major}`;
    if (!studentMap.has(studentKey)) {
      studentMap.set(
        studentKey,
        BigInt([...studentMap.keys()].filter(k => k.startsWith(`${deptKey}|${r.course_number}|`)).length)
      );
    }
    const s = studentMap.get(studentKey)!;

    const idx = c * COLLEGE_MULT + d * DEPT_MULT + k * COURSE_MULT + s;
    if (r === target) {
      leafIndex = idx;
      break;
    }
  }

  // 4) Compute proof
  const { root, pathElements, pathIndices } = tree.proof(Number(leafIndex));

  // 5) Print prover.toml snippet
  console.log(`leaf_index   = "${leafIndex}"`);
  console.log(`path         = [`);
  pathElements.forEach((e, i) => console.log(`  "${e.toString()}", // idx ${i}, dir=${pathIndices[i]}`));
  console.log(`]`);
  console.log(`pk_x_hi      = "${target.pk_x_hi}"`);
  console.log(`pk_x_lo      = "${target.pk_x_lo}"`);
  console.log(`pk_y_hi      = "${target.pk_y_hi}"`);
  console.log(`pk_y_lo      = "${target.pk_y_lo}"`);
  console.log(`professor    = "${PROFESSOR_CODES[target.professor]}"`);
  console.log(`grade        = "${GRADE_CODES[target.grade]}"`);
  console.log(`major        = "${majorMap.get(`${target.college}|${target.major}`)}"`);
  console.log(`college_idx  = "${collegeMap.get(target.college)}"`);
  console.log(`dept_idx     = "${deptMap.get(`${target.college}|${target.department}`)}"`);
  console.log(`course_idx   = "${COURSE_FIXED[target.course_number]}"`);
  console.log(`computed_root= "${root.toString()}"`);
  console.log(`expected_root= "${EXPECTED_ROOT}"`);
  console.log(`valid        = ${root.toString() === EXPECTED_ROOT}`);
})();
