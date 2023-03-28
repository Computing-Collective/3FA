import React from "react";
import { Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { Done } from "@mui/icons-material";

export function HoverCheckbox({ label, onChange }) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          onChange={onChange}
          sx={{
            "&.MuiCheckbox-root": {
              color: "white",
            },
            "&.MuiCheckbox-root:hover": {
              backgroundColor: "transparent",
            },
          }}
          checkedIcon={<Done />}
        />
      }
      label={label}
      sx={{
        "&.MuiFormControlLabel-root": {
          color: "white",
        },
      }}>
    </FormControlLabel>
  );
}
