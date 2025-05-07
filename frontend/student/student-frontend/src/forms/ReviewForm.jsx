import React from "react";
import { Button, Box, FormControlLabel, Switch, Typography, Checkbox  } from "@mui/material";
import LabeledTextField from "../components/LabeledTextField";
import LabeledSelect from "../components/LabeledSelect";
import Section from "../components/Section";

const ReviewForm = ({
  school, setSchool,
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
  sk, setSk,
  submitHandler,
  path, setPath,
  grade, setGrade,
  leafIndex, setLeafIndex,
  isCollegeDisabled, departments, majors, professors, colleges, courses,
  recommend, setRecommend,
  root, fetchRoot,
  includeMajorInReview, setIncludeMajorInReview,
  includeGradeInReview, setIncludeGradeInReview
}) => {
  const RATINGS = ["1", "2", "3", "4", "5"];
  const GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

  return (
    <Box component="form" onSubmit={submitHandler}>
      <Section title="Root">
      <LabeledTextField label="School" value={school} onChange={(e) => setSchool(e.target.value)} />
        <LabeledTextField label="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
        <Button variant="contained" color="primary" onClick={fetchRoot}>Fetch Root</Button>
        <Typography variant="body1"> {root} </Typography>
      </Section>

      <Section title="Review Details">
        <LabeledSelect label="College" value={college} onChange={(e) => setCollegeWrapper(e.target.value)} options={colleges} />
        <LabeledSelect label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} options={departments} disabled={isCollegeDisabled}/>
        <LabeledSelect label="Major" value={major} onChange={(e) => setMajor(e.target.value)} options={majors} disabled={isCollegeDisabled} />
        <FormControlLabel
        control={
          <Checkbox
            checked={includeMajorInReview}
            onChange={(e) => setIncludeMajorInReview(!includeMajorInReview)}
            name="includeMajorInReview"
            color="primary"
          />
        }
        label="Include in review"
      />
        <LabeledSelect label="Professor" value={professor} onChange={(e) => setProfessor(e.target.value)} options={professors} disabled={isCollegeDisabled} />
        <LabeledSelect label="Course" value={course} onChange={(e) => setCourse(e.target.value)} options={courses} disabled={isCollegeDisabled} />
        <LabeledSelect label="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} options={GRADES} disabled={isCollegeDisabled} />
        <FormControlLabel
        control={
          <Checkbox
            checked={includeGradeInReview}
            onChange={(e) => setIncludeGradeInReview(!includeGradeInReview)}
            name="includeGradeInReview"
            color="primary"
          />
        }
        label="Include in review"
      />
        <LabeledTextField label="Review" value={review} onChange={(e) => setReview(e.target.value)} multiline rows={4} />
        <LabeledSelect label="Rating" value={rating} onChange={(e) => setRating(e.target.value)} options={RATINGS} />
        <FormControlLabel
          control={
            <Switch
              checked={recommend}
              onChange={(e) => setRecommend(!recommend)}
              color="primary"
              name="recommend"
            />
          }
          label={"Do you recommend this course?"}
        />
      </Section>

      <Section title="Proof Inputs">
        <LabeledTextField label="Public Key X coordinate" value={pkX} onChange={(e) => setPkX(e.target.value)} />
        <LabeledTextField label="Public Key Y coordinate" value={pkY} onChange={(e) => setPkY(e.target.value)} />
        <LabeledTextField label="Secret Key" value={sk} onChange={(e) => setSk(e.target.value)} />
        <LabeledTextField label="Leaf Index" value={leafIndex} onChange={(e) => setLeafIndex(e.target.value)} />
        <LabeledTextField label="Path (one per row)" value={path} onChange={(e) => setPath(e.target.value)} multiline rows={18} />
      </Section>

      <Box mt={3}>
        <Button variant="contained" color="primary" type="submit">Submit Review</Button>
      </Box>
    </Box>
  );
};

export default ReviewForm;
