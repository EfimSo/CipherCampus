# Zero-Knowledge Proofs + Ethereum + BU Terrier

![Zero-Knowledge Terrier](pr00fesor.png)

## Project Overview

This project combines the spirit of **Boston University** with the cutting-edge technology of **Zero-Knowledge Proofs** and **Ethereum**.

We aim to explore privacy-enhancing cryptographic protocols, blockchain applications, and decentralized identity — all symbolized by our fierce and fearless mascot, **Rhett the Terrier**.

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
---

## Topics Covered
- Zero-Knowledge Proof Systems (ZKPs)
- Ethereum Smart Contracts
- Privacy and Scalability in Blockchain
- Cryptographic Protocols
- Decentralized Applications (dApps)

---

## Inspiration

Boston University's relentless pursuit of innovation meets the next frontier of cryptography and blockchain.  
Protect your identity, secure your data, and unleash your Terrier spirit!

---

## Quick Links
- [Learn more about Zero-Knowledge Proofs](https://zkproof.org/)
- [Ethereum Official Site](https://ethereum.org/)


## Features
- Anonymous course review submission
- Zero-knowledge proof verification
- Optional grade and major disclosure
- Secure proof generation and verification
- Modern, hacker-themed UI

## Technical Stack
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


