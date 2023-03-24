import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate, useNavigation } from "react-router-dom";
import { Backdoor } from "./Backdoor.jsx";
import { sessionContext, authContext } from "../app.jsx";
import { DisplayError } from "../components/DisplayError.jsx";
import { Video } from "../components/Video.jsx";
import { Button } from "@mui/material";
import { useNavToVault } from "../hooks/useNavToVault.js";

const api_endpoint = window.internal.getAPIEndpoint;

/**
 *
 * the camera page
 */
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

  /**
   * handler for submit button on camera page, sends API request to admin
   */
  async function handleCameraSubmit() {
    // the endpoint for face
    const endpoint = "face_recognition";
    // form because need to include img
    let formData = new FormData();
    formData.append("photo", data);
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
    handleNextNavigation(json, response);
  }

  // TODO duplicated code with submitButton.jsx
  function handleNextNavigation(json, response) {
    const next = json.next;
    const success = json.success;
    // retry api request
    if (success === 0 && next === undefined) {
      setError(json.msg); // change text for frontend
      return;
    }

    // go to vault
    if (response.ok && next === null) {
      // auth occurs within component
      setAuth(json.auth_session_id);
      return;
    }
    // name mangling between admin / client
    switch (next) {
      case "motion_pattern":
        navigate("/sensor");
        return;
      case "face_recognition":
        navigate("/camera");
        return;
    }
    // generally, want to go to next place directed by admin
    navigate(`/${json.next}`);
  }

  // TODO make this a nicer button with mui
  function CameraSubmitButton(props) {
    return <Button onClick={props.onClick}>Submit</Button>;
  }

  return (
    <>
      <h1>Smile for the camera</h1>
      {error !== "" && <DisplayError text={error} />}
      <Video
        setText={setError}
        onCapture={(blob) => {
          setData(blob);
        }}
        onClear={() => {
          setData(null);
        }}
      />
      <CameraSubmitButton
        data={data}
        endpoint={"camera"}
        onClick={(event) => {
          event.preventDefault();
          handleCameraSubmit(); // TODO does this work?
        }}
      />
      <Backdoor />
    </>
  );
}
