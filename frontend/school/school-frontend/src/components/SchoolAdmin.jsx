import { useState } from "react";
import { ethers } from "ethers";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";
import { SCHOOL_REGISTRY } from "../config/schoolRegConfig";

function SchoolAdmin() {
  const [courseId, setCourseId] = useState("");
  const [studentIdsInput, setStudentIdsInput] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    try {
      setStatus("Processing...");

      // Step 1: Parse and hash student IDs into commitments
      const newIds = studentIdsInput
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const newCommitments = newIds.map((id) =>
        keccak256(Buffer.from(id)).toString("hex")
      ); // Hashing the student IDs

      // Step 2: Fetch existing commitments from backend
      const res = await fetch(`http://localhost:3001/commitments/${courseId}`);
      const existingCommitments = res.ok ? await res.json() : [];

      // Step 3: Merge and deduplicate
      const mergedSet = new Set([...existingCommitments, ...newCommitments]);
      const finalCommitments = Array.from(mergedSet);

      // Step 4: Build Merkle tree
      const leaves = finalCommitments.map((c) =>
        Buffer.from(c.replace(/^0x/, ""), "hex")
      );
      const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
      const root = tree.getHexRoot();

      console.log("Merkle Root:", root);

      // Step 5: Connect to Wallet
      if (!window.ethereum) {
        setStatus("MetaMask not detected");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      // Step 6: Call smart contract to set root
      const contract = new ethers.Contract(
        SCHOOL_REGISTRY.address,
        SCHOOL_REGISTRY.abi,
        signer
      );

      const tx = await contract.setCourseRoot(courseId, root);
      await tx.wait();

      // Step 7: Save full updated commitment list to backend
      await fetch(`http://localhost:3001/commitments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, commitments: finalCommitments }),
      });

      setStatus(`Root committed and synced successfully: ${root}`);
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <h2> School Admin Panel</h2>

      <label>Course ID:</label>
      <input
        type="text"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        placeholder="e.g. CS101"
        style={{ width: "100%", padding: "8px", marginBottom: "1rem" }}
      />

      <label>Student IDs (one per line):</label>
      <textarea
        value={studentIdsInput}
        onChange={(e) => setStudentIdsInput(e.target.value)}
        placeholder="e.g.\ns12345\ns67890"
        rows={8}
        style={{ width: "100%", padding: "8px" }}
      />

      <button onClick={handleSubmit} style={{ marginTop: "1rem", padding: "10px" }}>
         Commit Student Merkle Root
      </button>

      <p style={{ marginTop: "1rem" }}>{status}</p>
    </div>
  );
}

export default SchoolAdmin;
