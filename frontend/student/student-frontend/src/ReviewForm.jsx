import { useState } from "react";
import { generateProof } from './zk/generateProof';

function ReviewForm() {
  const [course, setCourse] = useState("");
  const [review, setReview] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [major, setMajor] = useState("");
  const [status, setStatus] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [grade, setGrade] = useState("");
  const [pkX, setPkX] = useState("");
  const [pkY, setPkY] = useState("");

  const gradeMap = { 'A+':0, 'A':1, 'A-':2, 'B+':3, 'B':4, 'B-':5, 'C+':6, 'C':7, 'C-':8, 'D+':9, 'D':10, 'D-':11, 'F':12 };
  function toHex(bytes) { return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join(''); }

  const handleSubmit = async () => {
    setStatus("Generating ZK proof...");
    const inputs = {
      skLo: "0x00d0851a3b1d23ac235650bdca139b80", // TODO replace
      skHi: "0x1e99271c61d584811f9d008865f66d99",
      leafIndex: 2048, // TODO replace
      path: [],        // TODO replace
      pkX,
      pkY,
      collegeIdx: 0,
      deptIdx: 4,
      courseIdx: parseInt(course),
      grade: gradeMap[grade],
      professor: parseInt(professorId)
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

    const reviewData = { course, text: review, publicKey, grade, major, proof: proofHex };

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
        setStatus("Review submitted successfully!");
        setCourse("");
        setReview("");
        setPublicKey("");
        setMajor("");
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const testProof = async () => {
    setStatus("Generating test ZK proof...");
    const inputs = {
      skLo: "0x00d0851a3b1d23ac235650bdca139b80",
      skHi: "0x1e99271c61d584811f9d008865f66d99",
      leafIndex: 2048,
      path: [],
      pkX,
      pkY,
      collegeIdx: 0,
      deptIdx: 4,
      courseIdx: parseInt(course),
      grade: gradeMap[grade],
      professor: parseInt(professorId)
    };
    try {
      const proofBytes = await generateProof(inputs, Boolean(grade));
      const proofHex = "0x" + toHex(proofBytes);
      console.log("Generated proof hex:", proofHex);
      setStatus(`Test proof: ${proofHex}`);
    } catch (err) {
      setStatus(`Proof generation failed: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Submit Anonymous Course Review</h2>

      <label>Course:</label>
      <input
        type="text"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
        placeholder="Enter course number"
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />

      <label>Professor ID (optional):</label>
      <input
        type="number"
        value={professorId}
        onChange={(e) => setProfessorId(e.target.value)}
        placeholder="Professor ID"
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />

      <label>Grade (optional):</label>
      <input
        type="text"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        placeholder="Grade e.g. A, B+"
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />

      <label>Proof Public Key X:</label>
      <input
        type="text"
        value={pkX}
        onChange={(e) => setPkX(e.target.value)}
        placeholder="pkX hex"
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />

      <label>Proof Public Key Y:</label>
      <input
        type="text"
        value={pkY}
        onChange={(e) => setPkY(e.target.value)}
        placeholder="pkY hex"
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

      <label>Optional Major:</label>
      <input
        value={major}
        onChange={(e) => setMajor(e.target.value)}
        placeholder="CS, Math, etc."
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />

      <button onClick={testProof} style={{ marginRight: "1rem", padding: "10px 20px" }}>
        Test ZK Proof
      </button>

      <button onClick={handleSubmit} style={{ padding: "10px 20px" }}>
        Submit Review
      </button>

      <p style={{ marginTop: "1rem" }}>{status}</p>
    </div>
  );
}

export default ReviewForm;
