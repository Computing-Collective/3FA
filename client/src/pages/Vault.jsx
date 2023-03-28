import * as React from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authContext } from "../app.jsx";
import { logout } from "../functions/auth.js";
import { Backdoor } from "./Backdoor.jsx";
import { Button } from "@mui/material";

/**
 *
 * @returns the vault page
 */
export function Vault() {
  const navigate = useNavigate();
  const [auth, setAuth] = useContext(authContext);
  return (
    <>
      {/* hardcoded code hf */}
      <div className="absolute left-8 top-8 h-16 w-16">
        <Button
          color="primary"
          variant="outlined"
          onClick={() => logout(auth, setAuth, navigate)}>
          Logout
        </Button>
      </div>
      <div className="flex flex-col text-center">
        <h1>Vault</h1>
        {/* <Backdoor /> */}
      </div>
    </>
  );
}
