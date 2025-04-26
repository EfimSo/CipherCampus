#!/usr/bin/env ts-node
// compute_merkle_root.ts
// Reads courses_assigned.csv (with pk_x, pk_y, professor, grade) and outputs the Merkle root.

import { BarretenbergSync, Fr } from "@aztec/bb.js";
import { parse } from "csv-parse/sync";
import fs from "fs";

// Convert BigInt to 32-byte Fr
const toFr = (n: bigint) =>
  Fr.fromString("0x" + n.toString(16).padStart(64, "0"));

// Lookup tables for professor and grade encoding
const PROFESSORS = [
  "Dr. Alice Smith", "Dr. Bob Johnson", "Dr. Carol Williams", "Dr. David Brown",
  "Dr. Emma Davis", "Dr. Frank Miller", "Dr. Grace Wilson", "Dr. Henry Moore",
];
const GRADES = ["F", "D", "C-", "C", "C+", "B-", "B", "B+", "A-", "A"];
const PROFESSOR_CODES: Record<string, number> = PROFESSORS.reduce((a, v, i) => ({ ...a, [v]: i }), {} as any);
const GRADE_CODES: Record<string, number> = GRADES.reduce((a, v, i) => ({ ...a, [v]: i }), {} as any);

// CSV row type
interface Row {
  college: string;
  department: string;
  course_number: string;
  pk_x: string;
  pk_y: string;
  professor: string;
  grade: string;
}

// Sparse Merkle tree implementation
class MerkleTree {
  zeroValue = Fr.fromString(
    "18d85f3de6dcd78b6ffbf5d8374433a5528d8e3bf2100df0b7bb43a4c59ebd63"
  );
  levels: number;
  storage = new Map<string, Fr>();
  zeros: Fr[] = [];
  bb!: BarretenbergSync;

  constructor(levels: number) { this.levels = levels; }

  async init() {
    await BarretenbergSync.initSingleton();
    this.bb = BarretenbergSync.getSingleton();
    let cur = this.zeroValue;
    this.zeros.push(cur);
    for (let i = 0; i < this.levels; i++) {
      cur = this.bb.pedersenHash([cur, cur], 0);
      this.zeros.push(cur);
    }
  }

  root() {
    return this.storage.get(`${this.levels}-0`) ?? this.zeros[this.levels];
  }

  insertAt(index: number, leaf: Fr) {
    let cur = leaf;
    for (let lvl = 0; lvl < this.levels; lvl++) {
      const curIdx = index >> lvl;
      const sibIdx = curIdx ^ 1;
      this.storage.set(`${lvl}-${curIdx}`, cur);
      const sib = this.storage.get(`${lvl}-${sibIdx}`) ?? this.zeros[lvl];
      const [L, R] = curIdx & 1 ? [sib, cur] : [cur, sib];
      cur = this.bb.pedersenHash([L, R], 0);
    }
    this.storage.set(`${this.levels}-0`, cur);
  }
}

// Course-number → fixed index
const COURSE_FIXED: Record<string, number> = {"101":0,"102":1,"201":2,"202":3,"301":4,"302":5,"595":6};
const TREE_LEVELS = 18;
const COLLEGE_MULT = 1n << 15n, DEPT_MULT = 1n << 12n, COURSE_MULT = 1n << 9n;

(async () => {
  // 1) Read & parse
  const csvRaw = fs.readFileSync("courses_assigned.csv", "utf8");
  const rows: Row[] = parse(csvRaw, { columns: true, skip_empty_lines: true });

  // 2) Build index maps
  const collegeMap = new Map<string, number>();
  const deptMap = new Map<string, number>();
  const studentMap = new Map<string, number>();

  await BarretenbergSync.initSingleton();
  const bb = BarretenbergSync.getSingleton();

  // 3) Generate leaves
  type Leaf = { idx: bigint; leaf: Fr };
  const leaves: Leaf[] = [];

  for (const r of rows) {
    // college idx
    if (!collegeMap.has(r.college)) collegeMap.set(r.college, collegeMap.size);
    const cIdx = collegeMap.get(r.college)!;
    // dept idx
    const deptKey = `${r.college}|${r.department}`;
    if (!deptMap.has(deptKey)) deptMap.set(deptKey,
      [...deptMap.keys()].filter(k=>k.startsWith(`${r.college}|`)).length
    );
    const dIdx = deptMap.get(deptKey)!;
    // course idx
    const kIdx = COURSE_FIXED[r.course_number];
    // student idx (unique per course)
    const studentKey = `${deptKey}|${r.course_number}|${r.pk_x}|${r.pk_y}|${r.professor}|${r.grade}`;
    if (!studentMap.has(studentKey)) studentMap.set(studentKey,
      [...studentMap.keys()].filter(k=>k.startsWith(`${deptKey}|${r.course_number}|`)).length
    );
    const sIdx = studentMap.get(studentKey)!;

    // packed index
    const idxBig = BigInt(cIdx)*COLLEGE_MULT + BigInt(dIdx)*DEPT_MULT + BigInt(kIdx)*COURSE_MULT + BigInt(sIdx);

    // four inputs → Fr
    const pkx = BigInt(r.pk_x);
    const pky = BigInt(r.pk_y);
    const profNum = PROFESSOR_CODES[r.professor];
    const gradeNum = GRADE_CODES[r.grade];
    const fx = toFr(pkx), fy = toFr(pky), fp = toFr(BigInt(profNum)), fg = toFr(BigInt(gradeNum));

    // chain Pedersen: h1=[fx,fy], h2=[fp,fg], leaf=[h1,h2]
    const h1 = bb.pedersenHash([fx, fy], 0);
    const h2 = bb.pedersenHash([fp, fg], 0);
    const leaf = bb.pedersenHash([h1, h2], 0);

    leaves.push({ idx: idxBig, leaf });
  }

  // 4) Sort & insert
  leaves.sort((a,b)=>a.idx<b.idx?-1:1);
  const tree = new MerkleTree(TREE_LEVELS);
  await tree.init();
  let next = 0n;
  const zeroLeaf = tree.zeros[0];
  for (const {idx, leaf} of leaves) {
    while (next < idx) { tree.insertAt(Number(next), zeroLeaf); next++; }
    tree.insertAt(Number(idx), leaf);
    next = idx + 1n;
  }

  // 5) Output root
  console.log("Merkle root:", tree.root().toString());
})();
