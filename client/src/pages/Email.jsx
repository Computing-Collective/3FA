import React, { useState } from "react";
import { Backdoor } from "./Backdoor.jsx";
import { DisplayError } from "../components/DisplayError.jsx";
import { SubmitButton } from "../components/SubmitButton.jsx";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

/**
 *
 * @returns the email page
 */
export function Email() {
  const [error, setError] = useState("");

  return (
    <>
      <div className="m-2 flex flex-col justify-center text-center">
        {error !== "" && <DisplayError className="text-center" text={error} />}
        <h1>Log in or create a new account to access your secure vault.</h1>
        <SubmitButton
          placeholder="Email"
          type={"email"}
          endpoint={"email"}
          setError={setError}
        />
        <CreateAccount />
        <Backdoor />
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
