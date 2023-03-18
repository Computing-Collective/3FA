import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { authContext, sessionContext } from "../app.jsx";
import { useNavigate } from "react-router-dom";
import { handleSubmit } from "../hooks/handleSubmit.js";

// props.type is 'password' | 'email' | none (for input field)
// props.endpoint is 'email' | 'password' | 'camera' | 'motion_pattern/initialize' (for API endpoint)
// props.setText used to display err messages
// props.pico_id is used in 'sensor' page for admin
export function SubmitButton(props) {
  const navigate = useNavigate();
  const [session, setSession] = useContext(sessionContext); // session_id for admin
  const [auth, setAuth] = useContext(authContext); // auth for access to vault
  const [data, setData] = useState(""); // data sent to API
  const submitButton = document.getElementById("submitButton");

  useEffect(() => {
    props.setText(""); // clear text on submit
  }, [submitButton]);

  // navigate to vault if auth is modified within handleSubmit()
  useEffect(() => {
    if (auth !== null) {
      navigate("/vault");
    }
  }, [auth]);

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(event, {
            endpoint: props.endpoint,
            data: data, // main data payload to api
            navigate: navigate, // used for rerouting within the handleSubmit()
            session: session,
            setSession: setSession,
            setText: props.setText, // used for displaying err messages
            setAuth: setAuth, // used for going to vault
            pico_id: props.pico_id, // send pico_id if on 'sensor'
          });
        }}
      >
        {props.endpoint === "motion_pattern/initialize" ? null : (
          <input
            type={props.type}
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        )}
        <input id="submitButton" type="submit" value="Submit" />
      </form>
    </>
  );
}
