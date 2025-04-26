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
  pk_x: string;
  pk_y: string;
  professor: string;
  grade: string;
  major: string; // ← NEW
}

/*──────────────── Main script ───────────────────────────────*/
(async () => {
  /* 1. read CSV -------------------------------------------------------- */
  const csvRaw = fs.readFileSync("courses_assigned.csv", "utf8");
  const rows: Row[] = parse(csvRaw, { columns: true, skip_empty_lines: true });

  /* 2. enumerate indices ---------------------------------------------- */
  const collegeMap = new Map<string, number>();
  const deptMap = new Map<string, number>(); // college|dept  → idx
  const majorMap = new Map<string, number>(); // college|major → idx
  const studentMap = new Map<string, number>(); // college|dept|course|student → idx

  type Leaf = { idx: bigint; leaf: Fr };
  const leaves: Leaf[] = [];

  await BarretenbergSync.initSingleton();
  const bb = BarretenbergSync.getSingleton();

  for (const r of rows) {
    /* college index */
    if (!collegeMap.has(r.college)) collegeMap.set(r.college, collegeMap.size);
    const cIdx = collegeMap.get(r.college)!;

    /* department index (within college) */
    const deptKey = `${r.college}|${r.department}`;
    if (!deptMap.has(deptKey))
      deptMap.set(
        deptKey,
        [...deptMap.keys()].filter((k) => k.startsWith(`${r.college}|`)).length,
      );
    const dIdx = deptMap.get(deptKey)!;

    /* major index (within college, same rule) */
    const majorKey = `${r.college}|${r.major}`;
    if (!majorMap.has(majorKey))
      majorMap.set(
        majorKey,
        [...majorMap.keys()].filter((k) => k.startsWith(`${r.college}|`))
          .length,
      );
    const mIdx = majorMap.get(majorKey)!;

    /* course index (fixed) */
    const kIdx = COURSE_FIXED[r.course_number];
    if (kIdx === undefined)
      throw new Error(`Unknown course number: ${r.course_number}`);

    /* student index (first-seen per course) */
    const studentKey = `${deptKey}|${r.course_number}|${r.pk_x}|${r.pk_y}|${r.professor}|${r.grade}|${r.major}`;
    if (!studentMap.has(studentKey))
      studentMap.set(
        studentKey,
        [...studentMap.keys()].filter((k) =>
          k.startsWith(`${deptKey}|${r.course_number}|`),
        ).length,
      );
    const sIdx = studentMap.get(studentKey)!;

    /* packed leaf index (UNCHANGED) */
    const idxBig =
      BigInt(cIdx) * COLLEGE_MULT +
      BigInt(dIdx) * DEPT_MULT +
      BigInt(kIdx) * COURSE_MULT +
      BigInt(sIdx);

    /*──────────────── leaf hash  ──────────────────────────────*/
    // h1 = Pedersen(pk_x, pk_y)
    const h1 = bb.pedersenHash(
      [toFr(BigInt(r.pk_x)), toFr(BigInt(r.pk_y))],
      0,
    );

    // h2 = Pedersen(professorCode, gradeCode)
    const fp = toFr(BigInt(PROFESSOR_CODES[r.professor]));
    const fg = toFr(BigInt(GRADE_CODES[r.grade]));
    const h2 = bb.pedersenHash([fp, fg], 0);

    // fm = Fr(majorIndex)
    const fm = toFr(BigInt(mIdx));

    // leaf = Pedersen(Pedersen(pk), Pedersen(meta), major)
    const leaf0 = bb.pedersenHash([h1, h2], 0);
    const leaf = bb.pedersenHash([leaf0, fm], 0);

    leaves.push({ idx: idxBig, leaf });
  }

  /* 3. sort & insert --------------------------------------------------- */
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

  /* 4. output ---------------------------------------------------------- */
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
