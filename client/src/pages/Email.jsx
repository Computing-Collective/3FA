import React, { useState } from "react";
import { DisplayError } from "../components/DisplayError.jsx";
import { SubmitButton } from "../components/SubmitButton.jsx";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { HomeButton } from "../components/HomeButton.jsx";

/**
 *
 * @returns the email page
 */
export function Email() {
  const [error, setError] = useState("");
  const [severity, setSeverity] = useState('error');

  return (
    <>
      <HomeButton />
      <div className="m-2 flex w-full max-w-md flex-col items-center  text-center">
        <h1>Log in or create a new account to access your secure vault.</h1>
        {error !== "" && <DisplayError className="text-center" text={error} severity={severity} />}
        <SubmitButton
          placeholder="Email"
          type={"email"}
          endpoint={"email"}
          setError={setError}
          text={"Submit"}
          setSeverity={setSeverity}
        />
        <CreateAccount />
      </div>
    </>
  );
}

function CreateAccount() {
  const navigate = useNavigate();
  return (
    <>
      <Button color="primary" variant="outlined" onClick={() => navigate("/signup")}>
        Create Account
      </Button>
    </>
  );
}
