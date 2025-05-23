# CipherCampus
Github Repository link:
https://github.com/EfimSo/CipherCampus

## Problem Statement:

- Current course rating platforms lack reliable verification of reviewer enrollment, undermining the credibility of student evaluations and impairing decision-making for future students.

## High‑level Solution:

Our solution revolves around three key components:

1. **Blockchain Merkle roots**: Each school stores the Merkle root of enrolled students
   for corresponding courses on the blockchain. This provides a public record of enrolled students.
2. **Off-chain Noir ZK proof**: Before accepting a review, a Noir ZK proof is generated
   to confirm the reviewer's membership in the course. This proof is computed
   off-chain to ensure the privacy of the reviewer's personal information.
3. **Digital Signatures**: The reviewer signs the review text hash with their private key. The signature is validated under the public key which is proven to be in the Merkle tree subtree for the specific class using the ZK proof. This ensures the reviewer is the owner of the public key tied to the student identity. 

## Changes after the Presentation
### Demo Video
https://drive.google.com/file/d/1uSqtrUCTPob2ucQws5w1o-GlJkYjqI0x/view?usp=sharing
### Digital Signatures for Review Integrity

To enhance the security and integrity of the review system, we've implemented a digital signature mechanism using ECDSA with the secp256k1 curve. This addition provides several key security benefits review authenticity and data integrity.

The signature process works as follows:

1. Students generate their private/public key pair using secp256k1
2. Students' public key is hashed together with other information in the Merkle tree leaf.
3. When submitting a review, the student's private key signs the hash of the review text
4. The backend verifies that the public key is a in the Merkle tree and in the index range for the class the student wishes to review, using the proof. 
5. The backend verifies the public key has not submitted a review for the chosen class before (nullifier).
6. The signature is verified against the student's public key before storing the review. 
7. Only reviews with valid signatures are accepted into the system.

This enhancement makes our system more robust against malicious attacks while maintaining the privacy benefits of our zero-knowledge proofs. The school is unable to submit reviews on students' behalf as they are able to generate proofs but not sign. 

### Nullifiers
We added backend nullifiers by implementing a new SQL table mapping courses to public keys. If the user submits a review with the same public key, for the same class, the server returns a 500 code error. View the response in the network tab to see the nullifier error message. 


### Encryption Changes
The original encryption scheme used (grumpkin) was specialized to be used in the noir circuit. It was not popularly supported by Python or Javascript libraries, which forced us to switch to different elyptic curve (SECP256R1). We removed the private key from the Noir circuit inputs. We made public key a public input. In order to keep the public key below the module size of the noir circut, we had to split both the x and y-coordinates of the public key into low and high values (first and last 16 bytes). We also used the PEM format to encode the private key to be input into the front-end. The key is used without the begin and end tags which are appended by the frontend. 

---

## Topics Covered

- Zero-Knowledge Proof Systems (ZKPs)
- Ethereum Smart Contracts
- Privacy and Scalability in Blockchain
- Cryptographic Protocols
- Decentralized Applications (dApps)
- Digital Signatures
- Nullifier

---

## Features

- Anonymous course review submission
- Zero-knowledge proof verification
- Optional grade and major disclosure
- Secure proof generation and verification
- Digital Signatures for tamper-resistant identities and message integrity

---

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- Barretenberg (for proof generation)
- Nargo

---

### Frontend

- React
- Material-UI (MUI)
- Vite build system
- TypeScript
- Node (proof and signature generation server)

## Frontend breakdown

- ReviewForm.jsx: The main component that handles user input and proof generation. Split into two files:
   - frontend/student/student-frontend/src/ReviewForm.jsx handles state and API interaction
   - frontend/student/student-frontend/src/forms/ReviewForm.jsx defines the input form JSX
- CommentWall.jsx defines the review retrieval and page display.
- rootRetrieval.js: A utility function that fetches the current root from the backend
- mappings.js: Contains constants and mappings for courses, professors, grades, and majors
- The frontend is built using Vite and React, and when the user first open the page, they will be seeing the two dropdowns for college and department. The user can select the college and the department they want to see, and all the classes in that department will be displayed for the user to reference.
- The user can also select the button "Write Anonymous Review" to start the review process. The user will be prompted to enter the school and the semester to retrive the root from a contract. They will need to be able to type in review text, the rating, the professor, the course, the semester, the school, and the public key. The user can also select the checkbox "Include Grade" and "Include Major" to include the grade and major in the review. After gathering the information, which the user should be provided, the user will click the "Submit Review".
- "Submit Review" will trigger a function call to a node server that is currently part of front end, and the node server will generate a proof and send it to the backend. After the proof gets verified, we will sign the review with the private key and send it to the backend. There is another node server endpoint that generates a signature for the review, and the signature will be sent to the backend along with all the review information.
- We call the backend (without the private key after modifciation), and the backend return a receipt on whether it is successful or not.

### Backend

- Flask
- SQLAlchemy (for database)
- Python (for proof verification)

### Zero-Knowledge

- Noir (for circuit implementation)
- Barretenberg (for proof generation)
- Merkle Trees (for data integrity)

## Zero Knowledge Directory Structure

```text
zero_knowledge/
├── circuits/                        # ZK circuits for different disclosure settings
│   ├── verifyNoGradeNoMajor/
│   ├── verifyNoGradeYesMajor/
│   ├── verifyYesGradeNoMajor/
│   └── verifyYesGradeYesMajor/
│
├── tree_creation/
│   ├── build_full_merkle_tree.ts    # Builds a Merkle tree from the dataset
│   ├── compute_proof.ts             # Computes Merkle proof for the first student
│   ├── compute_root_from_json.ts    # Extracts root from a saved tree
│   ├── courses.csv                  # Raw input course enrollments
│   ├── courses_assigned.csv         # Processed data with public keys, grades, etc.
│   ├── full_tree.json               # Serialized Merkle tree
│   ├── modify_courses.py            # Assigns keys, professors, grades, majors
│   ├── parse_pks.py                 # Parses public key files if needed
│   ├── parsed_keys.json             # JSON-formatted key list (optional)
│   ├── private_keys.pem             # Private keys in PEM format
│   ├── public_keys.txt              # Public key coordinates (x, y) in hex
│   ├── contract_info.txt            # Contains deployed contract addresses/info
|   ├── generate_key_pair.py         # Generate public-private key pairs
│   ├── package.json
│   └── package-lock.json
│
└── contract_info.txt
```

#### Install Dependencies:

```bash
npm install
npm  i  csv-parse @aztec/bb.js
pip install pandas cryptography
```

Note: The tree is already generated so, thes following two steps may be skipped.

#### Generate courses_assigned.csv from courses.csv, appending keys, grades, professors, and majors:

```bash
python3 modify_courses.py
```

#### Build Merkle Tree:

```bash
npx ts-node --transpile-only build_full_merkle_tree.ts
```

#### Generate Merkle Proof for any Leaf:

```bash
npx ts-node --transpile-only compute_proof.ts
```

Prints a Prover.toml-compatible block, index can be modified for different leaves.

## Backend breakdown
- signature_check.py: file containing helper functions for signature verification
- verify_proof.py: file containing helper functions for proof verification. Verifies the proof by writing proof to binary and executing the verification using Barretenberg. 
- backend.py: main backend file. Defines the SQL schemas and creates the database. Exposes the endpoints. Executes signature and proof verification. Maintains nullifiers and performs uniqueness checks. 

---

### 1. Frontend

**Location:** `/frontend`  
**Port:** `http://localhost:5173` (default for Vite)

#### Install Dependencies:

```bash
cd frontend/student/student-frontend
npm install
```

#### Start the Frontend:

```bash
npm run dev
```

---

### 2. Proof Generation Server

**Location:** `/frontend/server.js`  
**Port:** `http://localhost:3002`

#### Start the Server:

```bash
cd frontend/server
npm install
node server.js
```

> This server handles proof and signature generation and must run separately from the Vite frontend. Executes Nargo and Barretenberg commands for ZK proof generation. 

---

### 3. Backend (Python)

**Location:** `/backend`  
**Port:** `http://localhost:5001`

#### Create and Activate Virtual Environment:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### Install Python Packages:

```bash
pip install -r requirements.txt
```

#### Run the Backend Server:

```bash
./venv/bin/python backend.py
```

---

### 4. Demo Website (Static Display)

Deployed at https://efimso.github.io/cc/

**Location:** `/display`  
**Port:** `http://localhost:8000`

#### Start the HTTP Server:

```bash
cd display
python3 -m http.server 8000
```

This is a static site used as a place for displaying and marketing the project.
