import * as React from "react";
import { useContext, useEffect, useState, useRef } from "react";
import { authContext, sessionContext } from "../app.jsx";
import { useNavigate } from "react-router-dom";
import { useNavToVault } from "../hooks/useNavToVault.js";
import { InputField } from "./InputField.jsx";
import { Button } from "@mui/material";

const api_endpoint = window.internal.getAPIEndpoint;

/**
 *
 * @param {object} props
 * @param {string} props.type - type of input field ('password' | 'email' | none (for input field))
 * @param {string} props.endpoint - API endpoint to send data to ex: 'email' | 'password' | 'camera' | 'motion_pattern/initialize' (for API endpoint)
 * @param {function} props.setError - function to set error message
 * @param {string} props.pico_id - pico_id of user (used in the 'sensor' page)
 *
 * @returns a submit button that sends data to the API
 */
export function SubmitButton(props) {
  const navigate = useNavigate(); // TODO change to useNavigation() to provide loading screens (primarily sensor?)
  // https://reactrouter.com/en/main/hooks/use-navigation
  const [session, setSession] = useContext(sessionContext); // session_id for admin
  const [auth, setAuth] = useContext(authContext); // auth for access to vault
  const [data, setData] = useState(""); // data sent to API

  // prop vars for handleSubmit
  const pico_id = props.pico_id;
  const setError = props.setError;
  const endpoint = props.endpoint;
  const text = props.text;

  // if we want an input field (email or password)
  const inputField = props.endpoint === "email" || props.endpoint === "password";

  const { initNav } = useNavToVault(auth);
  // navigate to vault if auth is modified within handleSubmit()
  // but only do that when component is mounted (so it doesn't infinite loop)
  useEffect(() => {
    initNav();
  }, [auth]);

  async function handleSubmit(props) {
    let apiPayload;
    endpoint === "motion_pattern/initialize"
      ? (apiPayload = props.data.map((item) => {
          return item.toUpperCase();
        })) // capitalize every elem in array
      : (apiPayload = props.data);

    // url to go to (defined in Postman)
    const url = `${api_endpoint}/api/login/${endpoint}/`;

    // send api request with password and return authed; get next loc
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        data: apiPayload,
        session_id: session,
        pico_id: pico_id,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const json = await response.json();
    // set session id
    if (endpoint === "email") {
      setSession(json.session_id);
    }

    handleNextNavigation(json, response);
  }

  function handleNextNavigation(json, response) {
    const next = json.next;
    const success = json.success;
    // retry api request
    if (success === 0 && next === undefined) {
      setError(json.msg); // change text for frontend
      return;
    }

    // go to vault
    if (response.ok && next === null) {
      // auth occurs within component
      setAuth(json.auth_session_id);
      return;
    }
    // name mangling between admin / client
    switch (next) {
      case "motion_pattern":
        navigate("/sensor");
        return;
      case "face_recognition":
        navigate("/camera");
        return;
    }
    // generally, want to go to next place directed by admin
    navigate(`/${json.next}`);
  }

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault(); // prevents page refresh
          handleSubmit({
            // if we want an input field, use the data from the input field else we take props.data (camera / motion)
            data: inputField ? data : props.data, // main data payload to api
          });
        }}>
        <div className="m-2 flex flex-col justify-center space-y-2">
          {inputField ? (
            <InputField
              className="p-2"
              placeholder={props.placeholder}
              type={props.type}
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          ) : null}
          <Button type="submit">{text}</Button>
        </div>
      </form>
    </>
  );
}
