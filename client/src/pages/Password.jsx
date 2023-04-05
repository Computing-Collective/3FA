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
  const [severity, setSeverity] = useState("error");

  return (
    <>
      <div className="flex flex-col text-center">
        <h1>Enter your password</h1>
        {error !== "" && (
          <DisplayError
            text={error}
            severity={severity}
            snackbar={true}
            setText={setError}
          />
        )}
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
