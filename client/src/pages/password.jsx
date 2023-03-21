import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleSubmit } from "../hooks/handleSubmit";
import { authContext, sessionContext } from "../app.jsx";
import { Backdoor } from "./backdoor.jsx";
import { DisplayText } from "../components/DisplayText.jsx";
import { SubmitButton } from "../components/SubmitButton.jsx";

export function Password() {
  const [text, setText] = useState("");
  const submitButton = document.getElementById("submitButton");

  useEffect(() => {
    setText(""); // clear text on submit
  }, [submitButton]);

  return (
    <>
      <h1>Enter your password</h1>
      <DisplayText text={text} />
      <SubmitButton endpoint={"password"} setText={setText} type={"password"} />
      <Backdoor />
    </>
  );
}
