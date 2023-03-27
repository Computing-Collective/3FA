import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authContext, sessionContext } from "../app.jsx";

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
      <h1 className="bg-gray-500 text-center text-white">Session: {session}</h1>
      <h1>Auth: {auth}</h1>
      <h1>Pico ID: {props.pico_id}</h1>
      <button onClick={() => navigate("/signup")}>Signup</button>
      <button onClick={() => navigate("/")}>Email</button>
      <button onClick={() => navigate("/password")}>Password</button>
      <button onClick={() => navigate("/sensor")}>Sensor</button>
      <button onClick={() => navigate("/camera")}>Camera</button>
      <button onClick={() => navigate("/vault")}>Vault</button>
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
