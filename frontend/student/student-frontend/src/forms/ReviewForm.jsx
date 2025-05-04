import React from "react";
import { Button, Box } from "@mui/material";
import LabeledTextField from "../components/LabeledTextField";
import LabeledSelect from "../components/LabeledSelect";
import Section from "../components/Section";

const ReviewForm = ({
  semester, setSemester,
  college, setCollegeWrapper,
  department, setDepartment,
  major, setMajor,
  professor, setProfessor,
  course, setCourse,
  review, setReview,
  rating, setRating,
  pkX, setPkX,
  pkY, setPkY,
  skLo, setSkLo,
  skHi, setSkHi,
  submitHandler,
  path, setPath,
  isCollegeDisabled, departments, majors, professors, colleges, courses
}) => {
  const RATINGS = ["1", "2", "3", "4", "5"];

  return (
    <Box component="form" onSubmit={submitHandler}>
      <Section title="Review Details">
        <LabeledTextField label="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
        <LabeledSelect label="College" value={college} onChange={(e) => setCollegeWrapper(e.target.value)} options={colleges} />
        <LabeledSelect label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} options={departments} disabled={isCollegeDisabled}/>
        <LabeledSelect label="Major" value={major} onChange={(e) => setMajor(e.target.value)} options={majors} disabled={isCollegeDisabled} />
        <LabeledSelect label="Professor" value={professor} onChange={(e) => setProfessor(e.target.value)} options={professors} disabled={isCollegeDisabled} />
        <LabeledSelect label="Course" value={course} onChange={(e) => setCourse(e.target.value)} options={courses} disabled={isCollegeDisabled} />
        <LabeledTextField label="Review" value={review} onChange={(e) => setReview(e.target.value)} multiline rows={4} />
        <LabeledSelect label="Rating" value={rating} onChange={(e) => setRating(e.target.value)} options={RATINGS} />
      </Section>

      <Section title="Proof Inputs">
        <LabeledTextField label="pkX" value={pkX} onChange={(e) => setPkX(e.target.value)} />
        <LabeledTextField label="pkY" value={pkY} onChange={(e) => setPkY(e.target.value)} />
        <LabeledTextField label="skLo" value={skLo} onChange={(e) => setSkLo(e.target.value)} />
        <LabeledTextField label="skHi" value={skHi} onChange={(e) => setSkHi(e.target.value)} />
        <LabeledTextField label="Path (one per row)" value={path} onChange={(e) => setPath(e.target.value)} multiline rows={18} />
      </Section>

      <Box mt={3}>
        <Button variant="contained" color="primary" type="submit">Submit Review</Button>
      </Box>
    </Box>
  );
};

export default ReviewForm;
