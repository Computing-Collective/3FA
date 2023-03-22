import * as React from "react";
import { useContext, useEffect, useState, useRef } from "react";
import { authContext, sessionContext } from "../app.jsx";
import { useNavigate } from "react-router-dom";
import { handleSubmit } from "../functions/handleSubmit.js";

// props.type is 'password' | 'email' | none (for input field)
// props.endpoint is 'email' | 'password' | 'camera' | 'motion_pattern/initialize' (for API endpoint)
// props.setText used to display err messages
// props.pico_id is used in 'sensor' page for admin
export function SubmitButton(props) {
  const navigate = useNavigate(); // TODO change to useNavigation() to provide loading screens (primarily sensor?)
  // https://reactrouter.com/en/main/hooks/use-navigation
  const [session, setSession] = useContext(sessionContext); // session_id for admin
  const [auth, setAuth] = useContext(authContext); // auth for access to vault
  const [data, setData] = useState(""); // data sent to API
  const submitButton = document.getElementById("submitButton");

  // if we want an input field (email or password)
  const inputField = props.endpoint === "email" || props.endpoint === "password";

  useEffect(() => {
    props.setText(""); // clear text on submit
  }, [submitButton]);

  // navigate to vault if auth is modified within handleSubmit()
  // but only do that when component is mounted (so it doesn't infinite loop)
  const isMounted = useRef(false);
  useEffect(() => {
    if (auth !== null && isMounted.current) {
      navigate("/vault");
    } else {
      isMounted.current = true;
    }
  }, [auth]);

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit({
            endpoint: props.endpoint,
            // if we want an input field, use the data from the input field else we take props.data (camera / motion)
            data: inputField ? data : props.data, // main data payload to api
            navigate: navigate, // used for rerouting within the handleSubmit()
            session: session,
            setSession: setSession,
            setText: props.setText, // used for displaying err messages
            setAuth: setAuth, // used for going to vault
            pico_id: props.pico_id, // send pico_id if on 'sensor'
          });
        }}>
        {inputField ? (
          <input
            type={props.type}
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        ) : null}
        <input id="submitButton" type="submit" value="Submit" />
      </form>
    </>
  );
}
