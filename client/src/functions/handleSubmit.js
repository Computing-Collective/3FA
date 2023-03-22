import * as React from "react";

const api_endpoint = window.internal.getAPIEndpoint;

export async function handleSubmit(event, props) {
  // routing
  const navigate = props.navigate;
  // define props
  const endpoint = props.endpoint; // 'email'
  // const data = props.data; // 'email@gmail.com'
  let data;
  endpoint === "motion_pattern/initialize"
    ? (data = props.data.map((item) => item.upper())) // capitalize every elem in array // TODO check
    : (data = props.data);
  console.log(await data.arrayBuffer());
  const session = props.session;
  const setSession = props.setSession;
  const setAuth = props.setAuth;

  // for displaying error
  const setText = props.setText;

  // for sensor
  const pico_id = props.pico_id;

  // url to go to (defined in Postman)
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
  // set session id
  if (endpoint === "email") {
    setSession(json.session_id);
  }

  handleNextNavigation(json, navigate);
}

export function handleNextNavigation(json, navigate) {
  const next = json.next;
  const success = json.success;
  // retry api request
  if (success === 0 && next === undefined) {
    setText(json.msg); // change text for frontend
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
