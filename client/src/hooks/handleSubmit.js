import * as React from "react";
import { useLocation, Navigate, useNavigate, useFetcher } from "react-router-dom";
import { sessionContext, authContext } from "./auth";

export async function handleSubmit(event, props) {
  event.preventDefault(); // remove form refresh
  // routing
  const navigate = props.navigate;
  // define props
  const endpoint = props.endpoint; // 'email'
  const data = props.data; // 'kelvinwong0519@gmail.com'
  const session = props.session;
  const setSession = props.setSession;

  // send api request with password and return authed; get next loc
  // const response = await fetch(url, {
  //   method: "GET",
  //   body: {
  //     endpoint: `/api/${endpoint}`,
  //     data: data,
  //   },
  // });
  // const json = await response.json();
  // // set session id
  // if (session === null) {
  //   setSession(json.session);
  // }
  // if id == None, login()
  // navigate(`${json.next}`);
}

// long polling for sensor
async function handleSensorSubmit() {
  let response = await fetch("/api/sensor");

  if (response.status == 502) {
    // Status 502 is a connection timeout error,
    // may happen when the connection was pending for too long,
    // and the remote server or a proxy closed it
    // let's reconnect
    await handleSensorSubmit();
  } else if (response.status != 200) {
    // TODO figure out this behaviour
    // An error - let's show it
    showMessage(response.statusText);
    // Reconnect in one second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await handleSensorSubmit();
  } else {
    // Get and go to next page
    const json = await response.json();
    navigate(`${json.next}`);
  }
}
