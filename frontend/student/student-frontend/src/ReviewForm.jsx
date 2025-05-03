import { useState } from "react";
import { generateProof } from './zk/generateProof';
import { generateSampleProof } from './zk/generateSampleProof';
import { getReviewRoot } from "./rootRetrieval.js";
import { PROFESSOR_CODES, GRADE_CODES, COURSE_FIXED, COLLEGE_MULT, DEPT_MULT, COURSE_MULT, COLLEGES, 
  collegeMap, departmentMap, majorMap
 } from "./mappings";

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
  const [root, setRoot] = useState(""); //for the meta mask 
  const [skLow, setSkX] = useState("");
  const [skHi, setSkY] = useState("");
  const [leafIndex, setLeafIndex] = useState("");
  const [deptIdx, setDeptIdx] = useState("")
  const [school, setSchool] = useState("");
  const [semester, setSemester] = useState("");
  const [rating, setRating] = useState("");
  const [recommend, setRecommend] = useState(false)
  const [pathStr, setPathStr]   = useState("");
  const [college, setCollege] = useState('');


  function toHex(bytes) { return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join(''); }

  const fetchRoot = async () => {
    try {
      const root = await getReviewRoot(school, semester);
      console.log("Current root:", root);
      setRoot(root);
      // You can store it in state if you want to display it:
      // setStatus(`Current review root: ${root}`);
    } catch (err) {
      console.error("Error fetching root:", err);
      // setStatus("Error fetching root");
    }
  };


  const handleSubmit = async () => {
    setStatus("Generating ZK proof...");
    const inputs = {
      skLo: "0x00d0851a3b1d23ac235650bdca139b80", // TODO replace
      skHi: "0x1e99271c61d584811f9d008865f66d99",
      leafIndex: 2048, // TODO replace
      path: [],        // TODO replace
      pkX,
      pkY,
      collegeIdx: COLLEGE_MULT[0], //0           
      deptIdx: DEPT_MULT[4],     //4         
      courseIdx: COURSE_FIXED[course],
      grade: GRADE_CODES[grade],
      professor: PROFESSOR_CODES[professorId]  // assumes professorId matches key in PROFESSOR_CODES
    };
    let proofHex;
    try {
      const proofBytes = await generateProof(inputs, Boolean(grade), Boolean(major));
      proofHex = "0x" + toHex(proofBytes);
    } catch (err) {
      setStatus(`Proof generation failed: ${err.message}`);
      return;
    }
    setStatus("Submitting...");

    const reviewData = {
      class_name: course,
      text: review,
      grade,
      major, 
      recommend,
      proof: proofHex,
      rating,
      grade
    };

    try {
      const response = await fetch("http://localhost:5000/write_review", {
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


  /*
  const testProof = async () => {
    setStatus("Generating test ZK proof...");
    const inputs = {
      skLo: "0x00d0851a3b1d23ac235650bdca139b80",
      skHi: "0x1e99271c61d584811f9d008865f66d99",
      leafIndex: 2048,
      path: [],
      pkX:"0x043109d503c77ce74afa15de64ff93b159acf8a06fea97a079f387d75adf8650",
      pkY:"0x1f1628c9f05d3f90f8a2f05c2fd88da4cc10ac7d772e6fe4fbb54e322fd74499",
      collegeIdx: 0,
      deptIdx: 4,
      courseIdx: 1,
      grade: gradeMap[1],
      professor: (4)
    };
    try {
      //const proofBytes = await generateProof(inputs, Boolean(grade), Boolean(major));
      const proofBytes = await generateSampleProof();
      const proofHex = "0x" + toHex(proofBytes);
      console.log("Generated proof hex:", proofHex);
      setStatus(`Test proof: ${proofHex}`);
    } catch (err) {
      setStatus(`Proof generation failed: ${err.message}`);
    }
  }; */

  const parsePath = (str) =>
    str
      .split(/\s+/)       // newline or spaces
      .filter(Boolean);   // drop empty entries
  
  const testProof = async () => {
    setStatus("Calling Python proof generator...");
  
    const payload = {
      leaf_index:   leafIndex,                   
      path:         parsePath(pathStr),          
      pk_x:         pkX,
      pk_y:         pkY,
      sk_lo:        skLow,
      sk_hi:        skHi,
      professor:    professorId,
      grade:        grade,
      major:        major ,
      college_idx:  collegeIdx,                 
      dept_idx:     deptIdx ,
      course_idx:   course,
    };
  
    try {
      const res   = await fetch("http://localhost:3002/run-proof", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify(payload),
      });
      const data  = await res.json();
      setStatus(`Test proof: ${data.proof}`);
      console.log("Generated proof hex:", data.proof);
    } catch (err) {
      setStatus(`Error calling Python: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Submit Anonymous Course Review</h2>
      <label>School:</label>
      <input
        value={school}
        onChange={(e) => setSchool(e.target.value)}
        placeholder="School Name"
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />
      <label>Semester:</label>
      <input
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
        placeholder="Semester (e.g., Spring 2025)"
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />
      <button onClick={fetchRoot}>Get Root</button>
      <br />
      {root && (
        <div style={{ marginBottom: "1rem", padding: "8px", backgroundColor: "blue" }}>
          Current Review Root: {root}
        </div>
      )}
      
      <label>Course:</label>
      <input
        type="text"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
        placeholder="Enter course number"
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />
  
      <label>Rating:</label>
      <input
        type="text"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
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

      <label>Secret Key Low:</label>
      <input
        value={skLow}
        onChange={(e) => setSkX(e.target.value)}
        placeholder="0x..."
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />

      <label>Secret Key High:</label>
      <input
        value={skHi}
        onChange={(e) => setSkY(e.target.value)}
        placeholder="0x..."
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />
      
      <label>Merkle-path (one hash per line):</label>
      <textarea
        value={pathStr}
        onChange={(e) => setPathStr(e.target.value)}
        placeholder="0x0501…\n0x0a8c…\n…"
        rows={6}
        style={{ width: "100%", marginBottom: "1rem", padding: "8px", fontFamily:"monospace" }}
      />

      <label>Leaf Index</label>
      <input
        value={leafIndex}
        onChange={(e) => setLeafIndex(e.target.value)}
        placeholder="Leaf index"
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />


      <label>Department Index</label>
      <input
        value={deptIdx}
        onChange={(e) => setDeptIdx(e.target.value)}
        placeholder="Dept Index"
        style={{ width: "100%", marginBottom: "1rem", padding: "8px" }}
      />
      
      <label style={{ cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={recommend}
        onChange={e => setRecommend(e.target.checked)}
      />
      I recommend the course
    </label>

    <label style={{ display: 'block', marginTop: 16 }}>
      <span style={{ marginRight: 8 }}>Choose College</span>
      <select
        value={college}
        onChange={(e) => setCollege(e.target.value)}
        style={{ padding: 4 }}
      >
        <option value="" disabled>
          -- college --
        </option>
        {COLLEGES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>

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
