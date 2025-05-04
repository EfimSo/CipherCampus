import { TextField } from "@mui/material";

const LabeledTextField = ({ label, value, onChange, ...props }) => (
  <TextField
    fullWidth
    margin="normal"
    label={label}
    value={value}
    onChange={onChange}
    {...props}
  />
);

export default LabeledTextField;
