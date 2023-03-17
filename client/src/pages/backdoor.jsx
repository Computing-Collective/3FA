import * as React from "react";
import { useNavigate } from "react-router-dom";
import { authContext, sessionContext } from "../app.jsx";
import { login } from "../hooks/auth.js";

export function Backdoor(props) {
  const navigate = useNavigate();
  const [session, setSession] = React.useContext(sessionContext);
  const [auth, setAuth] = React.useContext(authContext);

  return (
    <>
      <h1>Session: {session}</h1>
      <h1>Auth: {auth}</h1>
      <h1>Pico ID: {props.pico_id}</h1>
      <button onClick={() => navigate("/")}>Email</button>
      <button onClick={() => navigate("/password")}>Password</button>
      <button onClick={() => navigate("/sensor")}>Sensor</button>
      <button onClick={() => navigate("/camera")}>Camera</button>
      <button onClick={() => navigate("/vault")}>Vault</button>
      <button
        onClick={() => {
          setAuth(true);
          navigate("/vault");
        }}
      >
        set auth
      </button>
    </>
  );
}
