import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authContext, sessionContext } from "../app.jsx";
import "../index.css";

/**
 *
 * @param {object} props
 * @param {string} props.pico_id - the pico_id of the user
 * @returns a component used for testing. It has buttons to navigate to other pages and set the auth state
 */
export function Backdoor(props) {
  const navigate = useNavigate();
  const [session, setSession] = useContext(sessionContext);
  const [auth, setAuth] = useContext(authContext);

  return (
    <>
      <h1 className="bg-neutral-700">Session: {session}</h1>
      <h1 className="bg-neutral-700">Auth: {auth}</h1>
      <h1 className="bg-neutral-700">Pico ID: {props.pico_id}</h1>
      <button className="mx-5 bg-neutral-500" onClick={() => navigate("/signup")}>
        Signup
      </button>
      <button className="mx-5 bg-neutral-500" onClick={() => navigate("/")}>
        Email
      </button>
      <button className="mx-5 bg-neutral-500" onClick={() => navigate("/password")}>
        Password
      </button>
      <button className="mx-5 bg-neutral-500" onClick={() => navigate("/sensor")}>
        Sensor
      </button>
      <button className="mx-5 bg-neutral-500" onClick={() => navigate("/camera")}>
        Camera
      </button>
      <button
        className="mx-5 rounded-full bg-neutral-500"
        onClick={() => navigate("/vault")}>
        Vault
      </button>
      <button
        onClick={() => {
          setAuth(true);
          navigate("/vault");
        }}>
        set auth
      </button>
      <button
        className="rounded-full"
        onClick={() => {
          setAuth(null);
        }}>
        unauth
      </button>
    </>
  );
}
