import { Container, Typography, CssBaseline } from "@mui/material";
import CommentWall from "./CommentWall";

function App() {
  return (
    <>
      <CssBaseline /> {/* Provides a consistent baseline for styles */}
      <Container maxWidth="md" sx={{ minHeight: "100vh", bgcolor: "#f9fafb", py: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Course Review Portal
        </Typography>
        <CommentWall />
      </Container>
    </>
  );
}

export default App;
