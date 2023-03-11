import * as React from "react";
import { useNavigate } from "react-router-dom";
import { authContext } from "../app.jsx";
import { logout } from "../hooks/auth.js";

export function Vault() {
  const navigate = useNavigate();
  const [auth, setAuth] = React.useContext(authContext);
  return (
    <>
      <h1>Vault</h1>
      <button onClick={logout}>Logout</button>
      <Backdoor />
    </>
  );
}
