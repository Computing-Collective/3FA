import { Input } from "@mui/material";
import { TextField } from "@mui/material";
import React from "react";

export function InputField(props) {
  return (
    <>
      <TextField
        color="primary"
        disabled={false}
        label={props.placeholder}
        placeholder={props.placeholder}
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
        type={props.type}
        onChange={props.onChange}
      />
    </>
  );
}
