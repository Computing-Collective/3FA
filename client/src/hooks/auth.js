import * as React from "react";
import { authContext } from "../app.jsx";

const api_endpoint = process.env.API_ENDPOINT;

// returns true if authenticated via admin
export function login(auth) {
  // TODO send API req with auth, return true if ok.
  const endpoint = "validate";
  const url = `${api_endpoint}/api/client/${endpoint}/`;
  console.log(auth);
  fetch(url, {
    method: "POST",
    body: JSON.stringify({
      auth_session_id: auth,
    }),
    headers: { "Content-Type": "application/json" },
  }).then((response) => {
    response.json().then((json) => {
      console.log(json);
      return json.success === 1;
    });
  });
}

export async function logout(auth) {
  return async () => {
    setAuth(null);
    // TODO send to logout API and redirect user
  };
}

// pages api and returns a unique pico_id in ref to the admin
export function getUniquePicoID(pico_id) {
  const endpoint = "motion_pattern/unique";
  const url = `${api_endpoint}/api/login/${endpoint}/`;

  fetch(url, {
    method: "POST",
    body: JSON.stringify({
      pico_id: pico_id,
    }),
    headers: { "Content-Type": "application/json" },
  }).then((response) => {
    response.json().then((json) => {
      if (!response.ok || json.success === 0) {
        return getUniquePicoID(crypto.randomUUID());
      }
    });
  });
  return pico_id;
}
