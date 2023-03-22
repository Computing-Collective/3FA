import * as React from "react";
import { useState } from "react";
import { handleSubmit } from "../hooks/handleSubmit";
import { useLocation, useNavigate } from "react-router-dom";
import { Backdoor } from "./backdoor.jsx";
import { sessionContext, authContext } from "../app.jsx";
import { DisplayText } from "../components/DisplayText.jsx";
import { SubmitButton } from "../components/SubmitButton.jsx";

export function Camera() {
  const [text, setText] = useState("");
  const [data, setData] = useState(""); // camera input (base64?)

  return (
    <>
      <h1>Smile for the camera</h1>
      <DisplayText text={text} />
      <SubmitButton data={data} endpoint={"camera"} setText={setText} />
      <Backdoor />
    </>
  );
}
