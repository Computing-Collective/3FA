import React, { useContext, useState, useEffect } from "react";
import styled from "styled-components";
import { handleNextNavigation, handleSubmit } from "../functions/handleSubmit";
import { useLocation, useNavigate, useNavigation } from "react-router-dom";
import { Backdoor } from "./backdoor.jsx";
import { sessionContext, authContext } from "../app.jsx";
import { DisplayError } from "../components/DisplayError.jsx";
import { SubmitButton } from "../components/SubmitButton.jsx";
import { Video } from "../components/Video.jsx";
import { Button } from "@mui/material";
import { useNavToVault } from "../hooks/useNavToVault";

const api_endpoint = window.internal.getAPIEndpoint;

export function Camera() {
  const [error, setError] = useState(""); // error msg
  const [data, setData] = useState(""); // camera input (base64?)
  const [auth, setAuth] = useContext(authContext);
  const [session, setSession] = useContext(sessionContext);
  const navigation = useNavigation();
  const navigate = useNavigate();

  const { initNav } = useNavToVault();

  useEffect(() => {
    initNav();
  }, [auth]);

  return (
    <>
      <h1>Smile for the camera</h1>
      {error !== "" && <DisplayError text={error} />}
      <Video
        setText={setError}
        onCapture={async (blob) => {
          setData(blob);
        }}
        onClear={(event) => {
          event.preventDefault();
          setData(null);
        }}
      />
      {/* // TODO fix the console errors */}
      <CameraSubmitButton
        data={data}
        endpoint={"camera"}
        onClick={(event) => {
          event.preventDefault();
          handleCameraSubmit(data, session, navigate, setError, setAuth);
        }}
      />
      <Backdoor />
    </>
  );
}

/**
 * handler for submit button on camera page, sends API request to admin
 * @param {*} blob the image to send to backend
 * @param {*} session the session ID
 * @param {*} navigate used for navigating to other routes
 * @param {*} setText used for displaying error messages
 * @param {*} setAuth sets Auth if on last stage
 */
async function handleCameraSubmit(blob, session, navigate, setError, setAuth) {
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
  handleNextNavigation(json, response, { navigate, setError, setAuth });
}

function CameraSubmitButton(props) {
  return <Button onClick={props.onClick}>Submit</Button>;
}
