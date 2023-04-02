import { Input } from "@mui/material";
import { TextField } from "@mui/material";
import React from "react";

/**
 *
 * @param {boolean} autoFocus turn autoFocus on
 * @param {string} placeHolder the default text in the text field
 * @param {string} type the type of inputfield (adhere to html standards)
 * @param {React.SetStateAction} onChange onclick handler for the input field
 * @returns a jsx mui input field that is for dark mode
 */
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
