import { Box, Typography } from "@mui/material";

const Section = ({ title, children }) => (
  <Box mt={3}>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    {children}
  </Box>
);

export default Section;
