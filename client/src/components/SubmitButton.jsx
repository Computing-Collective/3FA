import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { authContext, sessionContext } from "../app.jsx";
import { useNavigate } from "react-router-dom";
import { useNavToVault } from "../hooks/useNavToVault.js";
import { InputField } from "./InputField.jsx";
import { LoadingButton } from "@mui/lab";
import { handleNextNavigation } from "../functions/handleNextNavigation.js";

const api_endpoint = window.internal.getAPIEndpoint;
const pico_api_endpoint = window.internal.getPicoEndpoint;

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
  const navigate = useNavigate();
  // https://reactrouter.com/en/main/hooks/use-navigation
  const [session, setSession] = useContext(sessionContext); // session_id for admin
  const [auth, setAuth] = useContext(authContext); // auth for access to vault
  const [data, setData] = useState(""); // data sent to API

  const [loading, setLoading] = useState(false); // sets if the button is loading

  // prop vars for handleSubmit
  const pico_id = props.pico_id;
  const setError = props.setError;
  const endpoint = props.endpoint;
  const text = props.text;

  const setSeverity = props.setSeverity;

  // if we want an input field (email or password)
  const inputField = props.endpoint === "email" || props.endpoint === "password";

  const { initNav } = useNavToVault(auth);
  // navigate to vault if auth is modified within handleSubmit()
  // but only do that when component is mounted (so it doesn't infinite loop)
  useEffect(() => {
    initNav();
  }, [auth]);

  async function handleSubmit(props) {
    setLoading(true); // change to loading button
    let apiPayload;
    if (endpoint === "motion_pattern/initialize") {
      // full-capitalize every elem in array
      apiPayload = props.data.map((item) => {
        return item.toUpperCase();
      });
      setError("Trying to connect to your sensor");
      setSeverity("info");
      // send pico_id to pico
      let response;
      try {
        response = await fetch(`${pico_api_endpoint}/pico_id`, {
          method: "POST",
          body: JSON.stringify({
            pico_id: pico_id,
          }),
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        // unable to connect
        setError("Error please try again");
        setSeverity("error");
      }

      const json = await response.json();

      const success = json.success;
      if (success === 1) {
        setError("Success, waiting for your sensor input");
        setSeverity("success");
      } else {
        setError("Error please try again");
        setSeverity("error");
      }
    } else {
      apiPayload = props.data;
    }

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

    endpoint === "motion_pattern/initialize" ? null : setLoading(false);
    setData("");

    handleNextNavigation({ json, response, setError, setAuth, navigate, setSeverity });
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
              autoFocus
              className="p-2"
              placeholder={props.placeholder}
              type={props.type}
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          ) : null}
          <LoadingButton
            sx={{
              ".MuiLoadingButton-loadingIndicator": {
                color: "white",
              },
            }}
            loading={loading}
            type="submit">
            {text}
          </LoadingButton>
        </div>
      </form>
    </>
  );
}
