import React, { useState } from "react";
import { handleSubmit } from "../functions/handleSubmit";
import { useLocation, useNavigate } from "react-router-dom";
import { Backdoor } from "./backdoor.jsx";
import { sessionContext, authContext } from "../app.jsx";
import { DisplayError } from "../components/DisplayError.jsx";
import { SubmitButton } from "../components/SubmitButton.jsx";

export function Email() {
  const [error, setError] = useState("");

  return (
    <>
      <h1>Enter your Email</h1>
      {error !== "" && <DisplayError text={error} />}
      <SubmitButton type={"email"} endpoint={"email"} setError={setError} />
      <Backdoor />
    </>
  );
}
