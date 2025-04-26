import { useState } from "react";

function ReviewForm() {
  const [course, setCourse] = useState("");
  const [review, setReview] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [professor, setProfessor] = useState("");
  const [grade, setGrade] = useState("");
  const [major, setMajor] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    setStatus("Submitting...");

    // Placeholder for future ZK circuit logic
    const proofPlaceholder = {
      leaf: "0x...",
      path: [],
      index: 0,
    };

    const reviewData = {
      course,
      text: review,
      publicKey,
      grade,
      major,
      ...proofPlaceholder,
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
      setStatus(` Error: ${error.message}`);
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

      <label>Public Key: </label>
      <input
        value={publicKey}
        onChange={(e) => setPublicKey(e.target.value)}
        placeholder="0x..."
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />
      <label>Professor: </label>
      <input
        value={publicKey}
        onChange={(e) => setProfessor(e.target.value)}
        placeholder="John Doe"
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
