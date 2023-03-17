import * as React from "react";
import { sessionContext, authContext } from "./auth";
import { login } from "./auth";

// import crypto library

const api_endpoint = window.internal.getAPIEndpoint();

export async function handleSubmit(event, props) {
  event.preventDefault(); // remove form refresh
  // routing
  const navigate = props.navigate;
  // define props
  const endpoint = props.endpoint; // 'email'
  const data = props.data; // 'kelvinwong0519@gmail.com'
  const session = props.session;
  const setSession = props.setSession;
  const auth = props.auth;
  const setAuth = props.setAuth;

  // for displaying error
  const text = props.text;
  const setText = props.setText;

  // for sensor
  const pico_id = props.pico_id;

  const url = `${api_endpoint}/api/login/${endpoint}/`;

  // send api request with password and return authed; get next loc
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      data: data,
      session_id: session,
      pico_id: pico_id,
    }),
    headers: { "Content-Type": "application/json" },
  });
  const json = await response.json();
  const next = json.next;
  const success = json.success;
  // set session id
  if (endpoint === "email") {
    setSession(json.session_id);
  }
  // retry api request
  if (success === 0 && next === undefined) {
    setText(json.msg);
    return;
  }

  // go to vault
  if (response.ok && next === null) {
    console.log(auth);
    setAuth(json.auth_session_id);
    console.log(auth);
    navigate("/vault");
    return;
  }
  /* 
  if (success = 0):
    wrong auth stage:
    login session timeout: 
      go to 'next' (pass me email)
  incorrect validation:
    if next == dne (undef), retry
  if (response.ok)
    if next != null
      correct: go to next
    if next == null
      look into auth_session_id and store, login()
  */
  switch (next) {
    case "motion_pattern":
      navigate("/sensor");
      return;
    case "face_recognition":
      navigate("/camera");
      return;
  }
  navigate(`/${json.next}`);
}
