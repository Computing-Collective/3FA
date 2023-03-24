import * as React from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authContext } from "../app.jsx";
import { logout } from "../functions/auth.js";
import { Backdoor } from "./Backdoor.jsx";

/**
 *
 * @returns the vault page
 */
export function Vault() {
  const navigate = useNavigate();
  const [auth, setAuth] = useContext(authContext);
  return (
    <>
      <h1>Vault</h1>
      <button onClick={() => logout(auth, setAuth, navigate)}>Logout</button>
      <Backdoor />
    </>
  );
}
