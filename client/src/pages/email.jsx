import * as React from "react";
import { handleSubmit } from "../hooks/handleSubmit";
import { useLocation, useNavigate } from "react-router-dom";
import { Backdoor } from "./backdoor.jsx";
import { sessionContext, authContext } from "../app.jsx";
import { DisplayText } from "../components/DisplayText.jsx";
import { SubmitButton } from "../components/SubmitButton.jsx";

export function Email() {
  const [text, setText] = React.useState("");

  return (
    <>
      <h1>Enter your Email</h1>
      <DisplayText text={text} />
      <SubmitButton type={"email"} endpoint={"email"} setText={setText} />
      <Backdoor />
    </>
  );
}
