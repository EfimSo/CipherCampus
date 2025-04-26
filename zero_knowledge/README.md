# CipherCampus


This repository provides a complete workflow for constructing, serializing, and verifying Merkle trees over student–course assignment data, powered by Grumpkin-based key generation and TypeScript utilities. It also includes a Python script for preparing and augmenting the raw CSV of course enrollments.

---

## 🚀 Features

- **Key Generation**: Rust-based `grumpkin_keygen` module to produce Grumpkin keypairs.
- **Course Augmentation**: `modify_courses.py` assigns public/private keypairs, professor(s), and random letter grades to each student–course record.
- **Merkle Tree Builder**: TypeScript scripts to build a full Merkle tree (`build_full_merkle_tree.ts`) and to generate a single‑leaf tree (`compute_root.ts`).
- **Proof Generation & Verification**:
  - Compute Merkle proofs (`compute_proof.ts`).
  - Verify single-leaf proofs (`verify_single_leaf.ts`).
  - Specialized verifiers in `verifyWithGrade/` and `verifyWithoutGrade/` for scenarios with or without grade data.
- **Contract Info**: `contract_info.txt` holds on‑chain Merkle root publishing details (address, ABI, etc.).

---

## 📁 Repository Structure

```
CipherCampus/
├── __pycache__/                  # Python bytecode (ignored in Git)
├── grumpkin_keygen/              # Rust module for Grumpkin keypair generation
├── node_modules/                 # Installed npm dependencies
├── verifyWithGrade/              # TS verifier including grade checks
├── verifyWithoutGrade/           # TS verifier excluding grade
├── build_full_merkle_tree.ts     # TS: assemble full Merkle tree from CSV + keypairs
├── compute_merkle_root.ts        # TS: compute root from serialized tree
├── compute_proof.ts              # TS: generate a proof for a leaf index
├── compute_root.ts               # TS: build a single‑leaf tree and extract its root
├── verify_single_leaf.ts         # TS: verify a proof against a given root
├── contract_info.txt             # On‑chain contract address and ABI details
├── courses_assigned.csv          # Raw student‑course enrollments (input)
├── full_tree.json                # Serialized full Merkle tree (output)
├── single_leaf_tree.json         # Serialized single‑leaf tree (output)
├── modify_courses.py             # Python: augment CSV with keys, professors, grades
├── package.json                  # npm project metadata & scripts
└── package-lock.json             # npm lockfile
```

---

## ⚙️ Prerequisites

- **Rust & Cargo**: for running the Grumpkin key generator
- **Node.js & npm** (v14+)
- **ts-node**: execute TypeScript files directly (`npm install -g ts-node` or `npm install` locally)
- **Python 3.x**
  - `pandas` (for CSV manipulation)

---

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <REPO_URL>
   cd CipherCampus
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies**
   ```bash
   pip install pandas
   ```

4. **Build Grumpkin keygen**
   ```bash
   cd grumpkin_keygen
   cargo build --release
   cd ..
   ```

---

## 💡 Usage Guide

### 1. Augment Course CSV
Use the Python script to enrich your enrollment data:
```bash
python modify_courses.py --input courses_assigned.csv --output courses_augmented.csv
```
This will:
- Assign each student a Grumpkin public/private key pair
- Randomly select up to two professors per course
- Assign a random letter grade (A+, A, A-, ..., F)


### 2. Generate Keypairs
```bash
cd grumpkin_keygen
cargo run --release
```
- Outputs `grumpkin_keypairs.json` in the `grumpkin_keygen/` folder.


### 3. Build the Full Merkle Tree
```bash
npx ts-node build_full_merkle_tree.ts \
  --csv courses_augmented.csv \
  --keys grumpkin_keygen/grumpkin_keypairs.json \
  --out full_tree.json
```


### 4. Compute & Inspect Merkle Root
```bash
npx ts-node compute_merkle_root.ts --tree full_tree.json --level 0
```
Outputs the root hash for the specified tree level.


### 5. Generate a Proof for a Leaf
```bash
npx ts-node compute_proof.ts \
  --tree full_tree.json \
  --index <leafIndex> \
  --out proof.json
```


### 6. Verify a Single‑Leaf Proof
```bash
npx ts-node verify_single_leaf.ts \
  --root <rootHash> \
  --proof proof.json \
  --leaf <serializedLeafData>
```


### 7. Grade‑Aware vs Grade‑Agnostic Verification
Choose the `verifyWithGrade/` or `verifyWithoutGrade/` subdirectory for specialized proof verifiers.
```bash
cd verifyWithGrade
npm install
npx ts-node verify.ts --help
```

---

## Contract Info
All on‑chain details for Merkle root publication can be found in `contract_info.txt`.

---

## Contributing
Contributions, issues, and feature requests are welcome! Please submit a PR or open an issue.

---

## License
This project is released under the **MIT License**.

