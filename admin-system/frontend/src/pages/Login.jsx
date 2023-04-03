import { useState, useContext } from "react";
import { TextField, Button } from "@mui/material";
import { DisplayError } from "../components/DisplayError.jsx";
import { useNavigate } from "react-router-dom";
import { Backdoor } from "../components/Backdoor.jsx";
import { authContext } from "../main.jsx";

const API_ENDPOINT = `${import.meta.env.VITE_API_ENDPOINT}/api/dashboard`;

export function Login() {
  // the auth session token
  const [auth, setAuth] = useContext(authContext);
  // display err msg
  const [error, setError] = useState("");
  // the email field
  const [email, setEmail] = useState("");
  // the password field
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  /**
   * @returns handler for the submit button 
   */
  async function handleSubmit() {
    const response = await fetch(`${API_ENDPOINT}/login`, {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const json = await response.json();
    json.success ? setAuth(json.auth_session_id) : setError(json.msg);
    navigate("/home");
  }

  return (
    <>
      <h1 className="text-xl">Admin Dashboard</h1>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          handleSubmit();
        }}>
        <div className="gap-y-2 m-2 flex p-2 flex-col">
          {error !== "" && <DisplayError text={error} />}
          <InputField
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            type="email"
          />
          <InputField
            placeholder="Enter your password"
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            type="password"
          />
          <Button type="submit">Submit</Button>
        </div>
      </form>
      {import.meta.env.DEV && <Backdoor />}
    </>
  );
}

