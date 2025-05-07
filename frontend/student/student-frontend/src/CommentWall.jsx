import { useState, useEffect, useMemo} from "react";
import ReviewForm from "./ReviewForm";
import LabeledSelect from "./components/LabeledSelect";
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { COLLEGES, departmentMap} from "./mappings";


function CommentWall() {
  const [viewMode, setViewMode] = useState("comments");
  const [reviews, setReviews] = useState({});

  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  
  const departments = useMemo(
    () => (college ? Object.keys(departmentMap[college]) : []),
    [college]
  );

  useEffect(() => {
    if (viewMode === "comments") {
      fetch("http://localhost:5001/read_reviews")
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => setReviews(data))
      .catch((err) => console.error("Failed to fetch reviews:", err));
    }
  }, [viewMode]);

    const displayedReviews = useMemo(
      () => (reviews[college] && reviews[college][department]) ? reviews[college][department] : [],
      [college, department]
    );

  return (
    <Box p={3}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setViewMode(viewMode === "comments" ? "write" : "comments")}
        sx={{ mb: 3 }}
      >
        {viewMode === "comments" ? "Write Anonymous Review" : "View All Comments"}
      </Button>

      {viewMode === "write" ? (
        <ReviewForm />
      ) : (
        <Box>
          <Typography variant="h5" gutterBottom>
            Anonymous Reviews
          </Typography>
          <LabeledSelect label="College" value={college} onChange={(e) => setCollege(e.target.value)} options={COLLEGES} />
          <LabeledSelect label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} options={departments}/>
          {reviews.length === 0 ? (
            <Typography>No reviews yet.</Typography>
          ) : (
            <List>
              {displayedReviews.map((rev, idx) => (
                <Paper key={idx} elevation={2} sx={{ mb: 2, p: 2 }}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={`Class: ${rev.class_name}`}
                      secondary={
                        <>
                          <Typography variant="body2"><strong>Review:</strong> {rev.text}</Typography>
                          {rev.professor_name && <Typography variant="body2"><strong>Professor:</strong> {rev.professor_name}</Typography>}
                          {rev.grade && <Typography variant="body2"><strong>Grade:</strong> {rev.grade === "NOT_USED" ? "Not disclosed" : rev.grade}</Typography>}
                          {rev.major && <Typography variant="body2"><strong>Major:</strong> {rev.major === "NOT_USED" ? "Not disclosed" : rev.major}</Typography>}
                          {rev.rating && <Typography variant="body2"><strong>Rating:</strong> {rev.rating}</Typography>}
                          {rev.recommend && (
                            <Typography variant="body2"><strong>Recommend:</strong> {rev.recommend === "True" ? 'Yes' : 'No'}</Typography>
                          )}
                          {rev.public_keyX && <Typography variant="body2"><strong>Public Key X Coordinate:</strong> {rev.public_keyX}</Typography>}    
                          {rev.public_keyY && <Typography variant="body2"><strong>Public Key Y Coordinate:</strong> {rev.public_keyY}</Typography>}    
                          {rev.signature && <Typography variant="body2" noWrap={true}><strong>Signature:</strong> {rev.signature}</Typography>}    
                        </>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          )}
        </Box>
      )}
    </Box>
  );
}

export default CommentWall;
