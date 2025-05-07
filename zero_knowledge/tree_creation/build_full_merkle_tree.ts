/****************************************************************
 * build_full_merkle_tree.ts
 *
 *   npm  i  csv-parse @aztec/bb.js
 *   npx  ts-node --transpile-only build_full_merkle_tree.ts
 ****************************************************************/

import { BarretenbergSync, Fr } from "@aztec/bb.js";
import { parse } from "csv-parse/sync";
import fs from "fs";

/*──────────────── helper: bigint → 32-byte Fr ───────────────*/
const toFr = (n: bigint) =>
  Fr.fromString("0x" + n.toString(16).padStart(64, "0"));

/*──────────────── IMerkleTree interface ─────────────────────*/
interface IMerkleTree {
  root(): Fr;
  proof(index: number): {
    root: Fr;
    pathElements: Fr[];
    pathIndices: number[];
    leaf: Fr;
  };
  insertAt(index: number, leaf: Fr): void;
}

const PROFESSORS = [
  "Dr. Alice Smith",
  "Dr. Bob Johnson",
  "Dr. Carol Williams",
  "Dr. David Brown",
  "Dr. Emma Davis",
  "Dr. Frank Miller",
  "Dr. Grace Wilson",
  "Dr. Henry Moore",
];

// grades in ascending order:
const GRADES = ["F", "D", "C-", "C", "C+", "B-", "B", "B+", "A-", "A"];

/*──────────────── Code look-up maps ─────────────────────────*/
const PROFESSOR_CODES: Record<string, number> = PROFESSORS.reduce(
  (acc, name, idx) => ((acc[name] = idx), acc),
  {} as Record<string, number>,
);

const GRADE_CODES: Record<string, number> = GRADES.reduce(
  (acc, g, idx) => ((acc[g] = idx), acc),
  {} as Record<string, number>,
);

/*──────────────── Sparse Pedersen MerkleTree ────────────────*/
class MerkleTree implements IMerkleTree {
  zeroValue = Fr.fromString(
    "18d85f3de6dcd78b6ffbf5d8374433a5528d8e3bf2100df0b7bb43a4c59ebd63",
  );
  levels: number;
  storage = new Map<string, Fr>();
  zeros: Fr[] = [];
  bb!: BarretenbergSync;

  constructor(levels: number) {
    this.levels = levels;
  }

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

  proof(index: number) {
    const leaf = this.storage.get(`0-${index}`) ?? this.zeros[0];
    const pathElements: Fr[] = [];
    const pathIndices: number[] = [];

    let cur = leaf;
    let curIdx = index;
    for (let lvl = 0; lvl < this.levels; lvl++) {
      const sibIdx = curIdx ^ 1;
      const sibling = this.storage.get(`${lvl}-${sibIdx}`) ?? this.zeros[lvl];

      pathElements.push(sibling);
      pathIndices.push(curIdx & 1);

      const [L, R] = curIdx & 1 ? [sibling, cur] : [cur, sibling];
      cur = this.bb.pedersenHash([L, R], 0);
      curIdx >>= 1;
    }
    return { root: cur, pathElements, pathIndices, leaf };
  }
}

/*──────────────── Fixed course-number mapping ───────────────*/
const COURSE_FIXED: Record<string, number> = {
  "101": 0,
  "102": 1,
  "201": 2,
  "202": 3,
  "301": 4,
  "302": 5,
  "595": 6,
};

/*──────────────── Constants for index packing ───────────────*/
const TREE_LEVELS = 18; // 2¹⁸ leaves
const COLLEGE_MULT = 1n << 15n; // 32768
const DEPT_MULT = 1n << 12n; // 4096
const COURSE_MULT = 1n << 9n; // 512

/*──────────────── CSV row type ──────────────────────────────*/
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

/*──────────────── Main script ───────────────────────────────*/
(async () => {
  const csvRaw = fs.readFileSync("/Users/berenaydogan/3.2./CS595/Project/CipherCampus/zero_knowledge/tree_creation/courses_assigned.csv", "utf8");
  const rows: Row[] = parse(csvRaw, { columns: true, skip_empty_lines: true });

  const collegeMap = new Map<string, number>();
  const deptMap = new Map<string, number>();
  const majorMap = new Map<string, number>();
  const studentMap = new Map<string, number>();

  type Leaf = { idx: bigint; leaf: Fr };
  const leaves: Leaf[] = [];

  await BarretenbergSync.initSingleton();
  const bb = BarretenbergSync.getSingleton();

  for (const r of rows) {
    if (!collegeMap.has(r.college)) collegeMap.set(r.college, collegeMap.size);
    const cIdx = collegeMap.get(r.college)!;

    const deptKey = `${r.college}|${r.department}`;
    if (!deptMap.has(deptKey))
      deptMap.set(
        deptKey,
        [...deptMap.keys()].filter((k) => k.startsWith(`${r.college}|`)).length,
      );
    const dIdx = deptMap.get(deptKey)!;

    const majorKey = `${r.college}|${r.major}`;
    if (!majorMap.has(majorKey))
      majorMap.set(
        majorKey,
        [...majorMap.keys()].filter((k) => k.startsWith(`${r.college}|`)).length,
      );
    const mIdx = majorMap.get(majorKey)!;

    const kIdx = COURSE_FIXED[r.course_number];
    if (kIdx === undefined)
      throw new Error(`Unknown course number: ${r.course_number}`);

    const studentKey = `${deptKey}|${r.course_number}|${r.pk_x_hi}|${r.pk_x_lo}|${r.pk_y_hi}|${r.pk_y_lo}|${r.professor}|${r.grade}|${r.major}`;
    if (!studentMap.has(studentKey))
      studentMap.set(
        studentKey,
        [...studentMap.keys()].filter((k) =>
          k.startsWith(`${deptKey}|${r.course_number}|`),
        ).length,
      );
    const sIdx = studentMap.get(studentKey)!;

    const idxBig =
      BigInt(cIdx) * COLLEGE_MULT +
      BigInt(dIdx) * DEPT_MULT +
      BigInt(kIdx) * COURSE_MULT +
      BigInt(sIdx);

    /*──────────────── leaf hash ─────────────────────────────*/

    const pkX_hi = BigInt(r.pk_x_hi);
    const pkX_lo = BigInt(r.pk_x_lo);
    const pkY_hi = BigInt(r.pk_y_hi);
    const pkY_lo = BigInt(r.pk_y_lo);

    const f_pk_x_lo = toFr(pkX_lo);
    const f_pk_x_hi = toFr(pkX_hi);
    const f_pk_y_lo = toFr(pkY_lo);
    const f_pk_y_hi = toFr(pkY_hi);

    const hx = bb.pedersenHash(
      [f_pk_x_lo, f_pk_x_hi],
      0,
    );

    const hy = bb.pedersenHash(
        [f_pk_y_lo, f_pk_y_hi],
        0,
    );

    const h1 = bb.pedersenHash(
        [hx, hy],
        0,
    );

    const fp = toFr(BigInt(PROFESSOR_CODES[r.professor]));
    const fg = toFr(BigInt(GRADE_CODES[r.grade]));
    const h2 = bb.pedersenHash([fp, fg], 0);

    const fm = toFr(BigInt(mIdx));

    const leaf0 = bb.pedersenHash([h1, h2], 0);
    const leaf = bb.pedersenHash([leaf0, fm], 0);

    leaves.push({ idx: idxBig, leaf });
  }

  leaves.sort((a, b) => (a.idx < b.idx ? -1 : 1));

  const tree = new MerkleTree(TREE_LEVELS);
  await tree.init();

  let next = 0n;
  const zeroLeaf = tree.zeros[0];

  for (const { idx, leaf } of leaves) {
    while (next < idx) {
      tree.insertAt(Number(next), zeroLeaf);
      next++;
    }
    tree.insertAt(Number(idx), leaf);
    next = idx + 1n;
  }

  console.log("Merkle root:", tree.root().toString());
  console.log("Inserted leaves:", leaves.length);

  fs.writeFileSync(
    "full_tree.json",
    JSON.stringify(
      {
        levels: tree.levels,
        zeroValue: tree.zeroValue.toString(),
        storage: Array.from(tree.storage.entries()).map(([k, v]) => [
          k,
          v.toString(),
        ]),
      },
      null,
      2,
    ),
  );
  console.log("✔  full_tree.json written");
})();
