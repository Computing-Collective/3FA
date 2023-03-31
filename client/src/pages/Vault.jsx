import * as React from "react";
import { useContext, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { authContext } from "../app.jsx";
import { logout } from "../functions/auth.js";
import { Backdoor } from "./Backdoor.jsx";
import { Button, Typography } from "@mui/material";
import { UploadButton } from "../components/UploadButton.jsx";
import { DisplayError } from "../components/DisplayError.jsx";

/**
 *
 * @returns the vault page
 */
export function Vault() {
  const navigate = useNavigate();
  const [auth, setAuth] = useContext(authContext);
  const [error, setError] = useState("");
  // an array of preview objects
  const [previews, setPreviews] = useState(useLoaderData().json);

  return (
    <>
      {/* hardcoded code hf */}
      <div className="absolute left-8 top-8 h-16 w-16">
        <Button
          color="primary"
          variant="contained"
          onClick={() => logout(auth, setAuth, navigate)}>
          Logout
        </Button>
      </div>
      {error !== "" && <DisplayError text={error} />}
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-3">
          <h1>Welcome to your secure vault</h1>
        </div>
        <div>
          <UploadButton auth={auth} setError={setError} />
        </div>
        <Backdoor />
      </div>
    </>
  );
}

function Preview({ fileName, date, size }) {
  return (
    <>
      <div className="flex flex-row bg-gray-600">
        <Typography>{fileName}</Typography>
      </div>
    </>
  );
}
