import { Input } from "@mui/joy";
import { TextField } from "@mui/material";
import React from "react";

export function InputField(props) {
  return (
    <>
      <Input
        color="primary"
        disabled={false}
        placeholder={props.placeholder}
        variant="outlined"
        size="md"
        required
        onChange={props.onChange}
      />
    </>
  );
}
