import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate, useNavigation } from "react-router-dom";
import { Backdoor } from "./Backdoor.jsx";
import { sessionContext, authContext } from "../app.jsx";
import { DisplayError } from "../components/DisplayError.jsx";
import { Video } from "../components/Video.jsx";
import { Button } from "@mui/material";
import { useNavToVault } from "../hooks/useNavToVault.js";
import { handleCameraSubmit } from "../functions/handleCameraSubmit.js";

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

  return (
    <>
      <div className="flex flex-col text-center">
        {error !== "" && <DisplayError text={error} />}
        <h1 className="m-2">Smile for the camera</h1>
        <Video
          setText={setError}
          onCapture={(blob) => {
            setData(blob);
          }}
          onClear={() => {
            setData(null);
          }}
        />
        <Button
          data={data}
          endpoint={"camera"}
          onClick={(event) => {
            event.preventDefault();
            handleCameraSubmit();
          }}>
          Submit
        </Button>
        <Backdoor />
      </div>
    </>
  );
}
