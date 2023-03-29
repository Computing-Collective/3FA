import { useState } from "react";
import { TextField } from "@mui/material";

export function Login() {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function DisplayText() {
    return <h1>text</h1>;
  }

  function InputField({ autoFocus, label, placeholder, type, onChange }) {
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

  return (
    <>
      <div className="flex flex-col">
        {/* {error !== "" && <DisplayText />} */}
        <InputField
          autoFocus
          label="Email"
          placeholder="Enter your email"
          type="email"
          onChange={(e) => {
            e.preventDefault();
            setEmail(e.target.value);
          }}
        />
        <InputField
          autoFocus
          label="Password"
          placeholder="Enter your password"
          type="password"
          onChange={(e) => {
            e.preventDefault();
            setPassword(e.target.value);
          }}
        />
      </div>
    </>
  );
}
