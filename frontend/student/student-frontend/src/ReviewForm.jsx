import { useState } from "react";
import { generateProof } from '../../../../zero_knowledge/zk-test/generateProof.js';

function ReviewForm() {
  const [course, setCourse] = useState("");
  const [review, setReview] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [grade, setGrade] = useState("");
  const [major, setMajor] = useState("");
  const [status, setStatus] = useState("");

  const gradeMap = { 'A+':0, 'A':1, 'A-':2, 'B+':3, 'B':4, 'B-':5, 'C+':6, 'C':7, 'C-':8, 'D+':9, 'D':10, 'D-':11, 'F':12 };
  function toHex(bytes) { return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join(''); }

  const handleSubmit = async () => {
    // Map letter grade to integer and generate proof
    const gradeInt = grade ? gradeMap[grade] : 0;
    setStatus("Generating ZK proof...");
    const inputs = {
      skLo: "0x00d0851a3b1d23ac235650bdca139b80", // TODO: replace with real secret key limbs
      skHi: "0x1e99271c61d584811f9d008865f66d99",
      leafIndex: 2048, // TODO: replace with real Merkle leaf index
      path: [],        // TODO: replace with real Merkle proof path
      pkX: "0x043109d503c77ce74afa15de64ff93b159acf8a06fea97a079f387d75adf8650",
      pkY: "0x1f1628c9f05d3f90f8a2f05c2fd88da4cc10ac7d772e6fe4fbb54e322fd74499",
      collegeIdx: 0,
      deptIdx: 4,
      courseIdx: 0,
      grade: gradeInt,
      professor: 4
    };
    let proofHex;
    try {
      const proofBytes = await generateProof(inputs, Boolean(grade));
      proofHex = "0x" + toHex(proofBytes);
    } catch (err) {
      setStatus(`Proof generation failed: ${err.message}`);
      return;
    }
    setStatus("Submitting...");

    const reviewData = {
      course,
      text: review,
      publicKey,
      grade,
      major,
      proof: proofHex,
    };

    try {
      const response = await fetch("http://localhost:3001/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      const result = await response.json();
      if (result.success) {
        setStatus("✅ Review submitted successfully!");
        setCourse("");
        setReview("");
        setPublicKey("");
        setGrade("");
        setMajor("");
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Submit Anonymous Course Review</h2>

      <label>Course Name:</label>
      <input
        value={course}
        onChange={(e) => setCourse(e.target.value)}
        placeholder="e.g. CS595"
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />

      <label>Review Text:</label>
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Write your anonymous review..."
        rows={4}
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />

      <label>Public Key (ephemeral):</label>
      <input
        value={publicKey}
        onChange={(e) => setPublicKey(e.target.value)}
        placeholder="0x..."
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />

      <label>Optional Grade:</label>
      <input
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        placeholder="A, B+, etc."
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />

      <label>Optional Major:</label>
      <input
        value={major}
        onChange={(e) => setMajor(e.target.value)}
        placeholder="CS, Math, etc."
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />

      <button onClick={handleSubmit} style={{ padding: "10px 20px" }}>
        Submit Review
      </button>

      <p style={{ marginTop: "1rem" }}>{status}</p>
    </div>
  );
}

export default ReviewForm;
