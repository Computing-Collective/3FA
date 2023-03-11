import * as React from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
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
