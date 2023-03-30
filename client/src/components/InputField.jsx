import { Input } from "@mui/material";
import { TextField } from "@mui/material";
import React from "react";

export function InputField({ autoFocus, placeholder, type, onChange }) {
  return (
    <>
      <TextField
        autoFocus={autoFocus}
        color="primary"
        disabled={false}
        label={placeholder}
        placeholder={placeholder}
        variant="outlined"
        size="md"
        required
        sx={{
          input: {
            color: "white",
          },
          "& label": {
            color: "white",
          },
          "&.MuiTextField-root": {
            fieldset: {
              borderColor: "white",
            },
            "&:hover fieldset": {
              borderColor: "primary.main",
            },
          },
        }}
        type={type}
        onChange={onChange}
      />
    </>
  );
}
