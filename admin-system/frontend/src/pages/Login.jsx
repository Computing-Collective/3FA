import { useState } from "react";
import { TextField } from "@mui/material";
import { DisplayError } from "../components/DisplayError.jsx";

const API_ENDPOINT = `${import.meta.env.VITE_API_ENDPOINT}/api/dashboard`;

export function Login() {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function InputField({ autoFocus, label, placeholder, type, onChange, value }) {
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

  async function handleSubmit() {
    // TODO endpoint url
    const response = await fetch(`${API_ENDPOINT}/login`, {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });
    const json = await response.json();
    console.log(json);
  }

  return (
    <>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          handleSubmit();
        }}>
        <div className="gap-y-2 m-2 flex flex-col">
          {error !== "" && <DisplayError text={error} />}
          <InputField
            autoFocus
            label="Email"
            placeholder="Enter your email"
            type="email"
            onChange={(e) => {
              e.preventDefault();
              setEmail(e.target.value);
            }}
            value={email}
          />
          <InputField
            label="Password"
            placeholder="Enter your password"
            type="password"
            onChange={(e) => {
              e.preventDefault();
              setPassword(e.target.value);
            }}
            value={password}
          />
        </div>
      </form>
    </>
  );
}
