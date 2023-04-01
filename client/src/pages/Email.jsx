import React, { useState } from "react";
import { Backdoor } from "./Backdoor.jsx";
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

  return (
    <>
      <HomeButton />
      <div className="m-2 flex flex-col justify-center text-center">
        <h1>Log in or create a new account to access your secure vault.</h1>
        {error !== "" && <DisplayError className="text-center" text={error} />}
        <SubmitButton
          placeholder="Email"
          type={"email"}
          endpoint={"email"}
          setError={setError}
          text={"Submit"}
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
