import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const LabeledSelect = ({ label, value, onChange, options = [], disabled = false }) => (
  <FormControl fullWidth margin="normal" disabled={disabled}>
    <InputLabel>{label}</InputLabel>
    <Select value={value} label={label} onChange={onChange}>
      <MenuItem value="" disabled>-- {label.toLowerCase()} --</MenuItem>
      {options.map((option) => (
        <MenuItem key={option} value={option}>{option}</MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default LabeledSelect;
