import * as React from "react";
import { useState, useEffect } from "react";
import { DisplayError } from "../components/DisplayError.jsx";
import { SubmitButton } from "../components/SubmitButton.jsx";

/**
 *
 * @returns the password page
 */
export function Password() {
  const [error, setError] = useState("");
  const submitButton = document.getElementById("submitButton");
  const [severity, setSeverity] = useState("error");

  useEffect(() => {
    setText(""); // clear text on input on submit
  }, [submitButton]);

  return (
    <>
      <div className="flex flex-col text-center">
        <h1>Enter your password</h1>
        {error !== "" && <DisplayError text={error} />}
        <SubmitButton
          text="Submit"
          placeholder="Password"
          endpoint={"password"}
          type={"password"}
          setError={setError}
          setSeverity={setSeverity}
        />
      </div>
    </>
  );
}
