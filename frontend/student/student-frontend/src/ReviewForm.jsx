import React, { useState, useMemo } from "react";
import ReviewForm from "./forms/ReviewForm";
import "./ReviewForm.css";
import { getReviewRoot } from "./rootRetrieval.js";
import { PROFESSOR_CODES, GRADE_CODES, COURSE_FIXED, COLLEGE_MULT, DEPT_MULT, COURSE_MULT, COLLEGES, collegeMap, departmentMap, majorMap} from "./mappings";





const ReviewPage = () => {
  const [school, setSchool] = useState("");
  const [semester, setSemester] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [major, setMajor] = useState("");
  const [professor, setProfessor] = useState("");
  const [course, setCourse] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState("");
  const [pkX, setPkX] = useState("");
  const [pkY, setPkY] = useState("");
  const [skLo, setSkLo] = useState("");
  const [skHi, setSkHi] = useState("");
  const [sk, setSk] = useState(""); // newly added given the changed schema 
  const [path, setPath] = useState("");
  const [root, setRoot] = useState("");
  const [leafIndex, setLeafIndex] = useState("");
  const [isCollegeDisabled, setIsCollegeDisabled] = useState(true);
  const [recommend, setRecommend] = useState(false);
  const [includeMajorInReview, setIncludeMajorInReview] = useState(false);
  const [includeGradeInReview, setIncludeGradeInReview] = useState(false);
  const [grade, setGrade] = useState("")

  const setStatus = (text) => {console.log(`Status: ${text}`)}

  const setCollegeWrapper = (college) => {
    setCollege(college)
    if (college){
      setIsCollegeDisabled(false)
    }
    else{
      setIsCollegeDisabled(true)
    }
  }

  const majors = useMemo(
    () => (college ? Object.keys(majorMap[college]) : []),
    [college]
  );

  const departments = useMemo(
    () => (college ? Object.keys(departmentMap[college]) : []),
    [college]
  );

  const courses = useMemo(
    () => (college ? Object.keys(COURSE_FIXED[college]) : []),
    [college]
  );

  const professors = Object.keys(PROFESSOR_CODES)

  function toHex(bytes) { return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join(''); }

  const fetchRoot = async () => {
    try {
      const root = await getReviewRoot(school, semester);
      console.log("Current root:", root);
      setRoot(root);
      setStatus(`Current review root: ${root}`);
    } catch (err) {
      console.error("Error fetching root:", err);
      setStatus("Error fetching root");
    }
  };

  const parsePath = (str) =>
    str
      .split(/\s+/)      
      .filter(Boolean); 
  
  const generateProof = async () => {
    setStatus("Calling Python proof generator...");


    const payload = {
      leaf_index:   leafIndex,                   
      path:         parsePath(path),          
      pk_x:         pkX,
      pk_y:         pkY,
      sk_lo:        skLo,
      sk_hi:        skHi,
      professor:    PROFESSOR_CODES[professor],
      grade:        GRADE_CODES[grade],
      major:        majorMap[college][major] ,
      college_idx:  collegeMap[college],                 
      dept_idx:     departmentMap[college][department] ,
      course_idx:   COURSE_FIXED[college][course],
      include_grade: includeGradeInReview,
      include_major: includeMajorInReview,
      root
    };
  
    try {
      const res   = await fetch("http://localhost:3002/run-proof", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify(payload),
      });
      const data  = await res.json();
      const firstSigmaIndex = data.proof.indexOf('∑');

      const proof = firstSigmaIndex !== -1 
        ? data.proof.slice(firstSigmaIndex + 1).trim() 
        : '';
      console.log("Generated proof hex:", proof);
      return proof
    } catch (err) {
      setStatus(`Error calling Python: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("Generating ZK proof...");
    /*
    let proofHex;
    try {
      const proofBytes = await generateProof();
      proofHex = proofBytes;
      if (!proofHex){
        setStatus(`Proof generation failed: ${err.message}`);
        return;
      }          
    } catch (err) {
      setStatus(`Proof generation failed: ${err.message}`);
      return;
    }
      */
    setStatus("Submitting...");

    // Send the message to sign to the backend
const res = await fetch("http://localhost:3002/sign-review", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: review, sk }),
});
const { signature } = await res.json();
console.log("Received signature:", signature);



    const reviewData = {
      class_name: `${department} ${course}`,
      text: review,
      "grade": includeGradeInReview ? grade: "NOT_USED",
      "major": includeMajorInReview ? major: "NOT_USED", 
      recommend,
      "proof": proofHex,
      rating,
      department,
      college
    };

    try {
      const response = await fetch("http://localhost:5001/write_review", {
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

  return (
    <ReviewForm
      school={school} setSchool={setSchool}
      semester={semester} setSemester={setSemester}
      college={college} setCollegeWrapper={setCollegeWrapper}
      department={department} setDepartment={setDepartment}
      major={major} setMajor={setMajor}
      professor={professor} setProfessor={setProfessor}
      course={course} setCourse={setCourse}
      review={review} setReview={setReview}
      rating={rating} setRating={setRating}
      pkX={pkX} setPkX={setPkX}
      pkY={pkY} setPkY={setPkY}
      skLo={sk} setSkLo={setSk}
      skHi={skHi} setSkHi={setSkHi}
      submitHandler={handleSubmit}
      isCollegeDisabled={isCollegeDisabled}
      departments={departments}
      majors={majors}
      professors={professors}
      colleges={COLLEGES}
      courses={courses}
      path={path} setPath={setPath}
      grade={grade} setGrade={setGrade}
      leafIndex={leafIndex} setLeafIndex={setLeafIndex}
      recommend={recommend} setRecommend={setRecommend}
      root={root} fetchRoot={fetchRoot}
      includeMajorInReview={includeMajorInReview} setIncludeMajorInReview={setIncludeMajorInReview}
      includeGradeInReview={includeGradeInReview} setIncludeGradeInReview={setIncludeGradeInReview}
    />
  );
};

export default ReviewPage;
