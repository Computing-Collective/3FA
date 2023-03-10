import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import sessionConsumer from "./sessionAuth";

export async function handleSubmit(props) {
  // routing
  const navigate = useNavigate();
  const { state } = useLocation;
  // define props
  const endpoint = props.endpoint; // 'email'
  const data = props.data; // 'kelvinwong0519@gmail.com'
  const [session, setSession] = sessionConsumer();
  // send api request with password and return authed; get next loc
  // const response = await fetch(url, {
  //   method: "GET",
  //   body: {
  //     endpoint: `/api/${endpoint}`,
  //     data: data,
  //   },
  // });
  // const json = await response.json();
  // set session id
  // navigate(state?.path || "/vault");
  navigate("/lock");
}
