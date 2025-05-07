## Features
- Anonymous course review submission
- Zero-knowledge proof verification
- Optional grade and major disclosure
- Secure proof generation and verification

---

## Changes after the Presentation

### Digital Signatures for Review Integrity
To enhance the security and integrity of the review system, we've implemented a digital signature mechanism using ECDSA with the secp256k1 curve. This addition provides several key security benefits review authenticity and data integrity.

The signature process works as follows:
1. Students generate their private/public key pair using secp256k1
2. When submitting a review, the student's private key signs the review text
3. The signature is verified against the student's public key before storing the review
4. Only reviews with valid signatures are accepted into the system

This enhancement makes our system more robust against malicious attacks while maintaining the privacy benefits of our zero-knowledge proofs.

### Nullifier


### SQL Schema Changes

### Encryption Changes 


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

## Inspiration



---

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


### Frontend
- React
- Material-UI (MUI)
- Vite build system
- TypeScript 

### Backend
- Flask
- SQLAlchemy (for database)
- Python (for proof verification)

### Zero-Knowledge
- Noir (for circuit implementation)
- Barretenberg (for proof generation)
- Merkle Trees (for data integrity)

## Frontend breakdown 
- ReviewForm.jsx: The main component that handles user input and proof generation
- rootRetrieval.js: A utility function that fetches the current root from the backend
- mappings.js: Contains constants and mappings for courses, professors, grades, and majors
- The frontend is built using Vite and React, and when the user first open the page, they will be seeing the two dropdowns for college and department. The user can select the college and the department they want to see, and all the classes in that department will be displayed for the user to reference. 
- The user can also select the button "Write Anonymous Review" to start the review process. The user will be prompted to enter the school and the semester to retrive the root from a contract. They will need to be able to type in review text, the rating, the professor, the course, the semester, the school, and the public key. The user can also select the checkbox "Include Grade" and "Include Major" to include the grade and major in the review. After gathering the information, which the user should be provided, the user will click the "Submit Review".
- "Submit Review" will trigger a function call to a node server that is currently part of front end, and the node server will generate a proof and send it to the backend. After the proof gets verified, we will sign the review with the private key and send it to the backend. There is another endpoint that generates a signature for the review, and the signature will be sent to the backend along with all the review information.
- We call the backend (without the private key after modifciation), and the backend return a reciept on whether it is successful or not. 


## Backend breakdown

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- Docker (optional, for development)
- Barretenberg (for proof generation)


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
**Port:** `http://localhost:3001` (or whatever `server.js` is configured to use)

#### Start the Server:
```bash
cd frontend/server
npm install
node server.js
```

> This server handles proof generation and must run separately from the Vite frontend.

---

### 3. Backend (Python)

**Location:** `/backend`  
**Port:** `http://localhost:5000` (or based on what's set in `backend.py`)

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

**Location:** `/display`  
**Port:** `http://localhost:8000`

#### Start the HTTP Server:
```bash
cd display
python3 -m http.server 8000
```

> This is a static site used as a demo for displaying proofs or results.


