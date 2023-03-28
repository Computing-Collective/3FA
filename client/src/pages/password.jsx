import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleSubmit } from "../functions/handleSubmit";
import { authContext, sessionContext } from "../app.jsx";
import { Backdoor } from "./backdoor.jsx";
import { DisplayError } from "../components/DisplayError.jsx";
import { SubmitButton } from "../components/SubmitButton.jsx";

/**
 *
 * @returns the password page
 */
export function Password() {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const submitButton = document.getElementById("submitButton");

  useEffect(() => {
    setText(""); // clear text on input on submit
  }, [submitButton]);

  return (
    <>
      <h1>Enter your password</h1>
      {error !== "" && <DisplayError text={error} />}
      <SubmitButton
        endpoint={"password"}
        setText={setText}
        type={"password"}
        setError={setError}
      />
      <Backdoor />
    </>
  );
}