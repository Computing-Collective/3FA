import React from "react";
import { TextField } from "@mui/material";

/**
 *
 * @param {*} autoFocus if the input field is autofocused
 * @param {string} label the label from mui
 * @param {string} placeholder the placeholder for the input field
 * @param {string} type the type of the input (html)
 * @param {function} onChange the onChange handler
 * @param {string} value the value inside the input
 * @returns a jsx input field
 */
export function InputField({ autoFocus, label, placeholder, type, onChange, value }) {
  return (
    <>
      <TextField
        autoFocus={autoFocus}
        color="primary"
        disabled={false}
        label={label}
        placeholder={placeholder}
        variant="outlined"
        size="md"
        required
        value={value}
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
