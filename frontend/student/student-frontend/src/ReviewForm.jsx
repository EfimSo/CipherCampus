import React, { useState } from "react";
import ReviewForm from "./forms/ReviewForm";
import "./ReviewForm.css";

const ReviewPage = () => {
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

  const departments = ["CS", "Math", "Physics"];
  const majors = ["CS", "Biology"];
  const isCollegeDisabled = false;

  const handleSubmit = (e) => {
    e.preventDefault();
    // form logic
  };

  return (
    <ReviewForm
      semester={semester} setSemester={setSemester}
      college={college} setCollege={setCollege}
      department={department} setDepartment={setDepartment}
      major={major} setMajor={setMajor}
      professor={professor} setProfessor={setProfessor}
      course={course} setCourse={setCourse}
      review={review} setReview={setReview}
      rating={rating} setRating={setRating}
      pkX={pkX} setPkX={setPkX}
      pkY={pkY} setPkY={setPkY}
      skLo={skLo} setSkLo={setSkLo}
      skHi={skHi} setSkHi={setSkHi}
      submitHandler={handleSubmit}
      isCollegeDisabled={isCollegeDisabled}
      departments={departments}
      majors={majors}
    />
  );
};

export default ReviewPage;
