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
        type={props.type}
        onChange={props.onChange}
      />
    </>
  );
}
