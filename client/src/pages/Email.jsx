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
      <h1>Enter your Email</h1>
      {error !== "" && <DisplayError text={error} />}
      <CreateAccount />
      <SubmitButton type={"email"} endpoint={"email"} setError={setError} />
      <Backdoor />
    </>
  );
}

function CreateAccount() {
  const navigate = useNavigate();
  return (
    <>
      <Button variant="plain" onClick={() => navigate("/signup")}>
        Create Account
      </Button>
    </>
  );
}
