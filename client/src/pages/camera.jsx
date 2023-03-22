import React, { useContext, useState } from "react";
import styled from "styled-components";
import { handleSubmit } from "../functions/handleSubmit";
import { useLocation, useNavigate, useNavigation } from "react-router-dom";
import { Backdoor } from "./backdoor.jsx";
import { sessionContext, authContext } from "../app.jsx";
import { DisplayText } from "../components/DisplayText.jsx";
import { SubmitButton } from "../components/SubmitButton.jsx";
import { Video } from "../components/Video.jsx";

const api_endpoint = window.internal.getAPIEndpoint;

export function Camera() {
  const [text, setText] = useState("");
  const [data, setData] = useState(""); // camera input (base64?)
  const [session, setSession] = useContext(sessionContext);
  const navigation = useNavigation();
  const navigate = useNavigate();

  return (
    <>
      <h1>Smile for the camera</h1>
      <DisplayText text={text} />
      <Video
        setText={setText}
        onCapture={async (blob) => {
          setData(blob);
        }}
        onClear={(event) => {
          event.preventDefault();
          handleCameraSubmit(blob, session);
        }}
      />
      <SubmitButton data={data} endpoint={"camera"} setText={setText} />
      <Backdoor />
    </>
  );
}

async function handleCameraSubmit(blob, session, navigate) {
  // the endpoint for face
  const endpoint = "face_recognition";
  // form because need to include img
  let formData = new FormData();
  formData.append("photo", blob);
  formData.append(
    "request",
    JSON.stringify({
      session_id: session,
    })
  );
  // send api request with blob
  const response = await fetch(`${api_endpoint}/api/login/${endpoint}/`, {
    method: "POST",
    body: formData,
  });
  const json = await response.json();
  navigate(`/${json.next}`);
}
