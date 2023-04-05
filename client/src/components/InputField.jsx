import { TextField, InputAdornment, IconButton } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import React, { useState } from "react";

/**
 *
 * @param {boolean} autoFocus turn autoFocus on
 * @param {string} placeHolder the default text in the text field
 * @param {string} type the type of input field (adhere to html standards)
 * @param {React.SetStateAction} onChange onclick handler for the input field
 * @returns a jsx mui input field that is for dark mode
 */
export function InputField({ autoFocus, placeholder, type, onChange, value }) {
  const [showPassword, setShowPassword] = useState(false); // show or hide password
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  return (
    <>
      <TextField
        autoFocus={autoFocus}
        color="primary"
        disabled={false}
        label={placeholder}
        type={showPassword ? "text" : type}
        value={value}
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
        onChange={onChange}
        InputProps={{
          endAdornment: (
            type === "password" ? 
            (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  sx={{ color: "white" }}
                >
                  {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>
            ) : null
          )
        }}
      />
    </>
  );
}
