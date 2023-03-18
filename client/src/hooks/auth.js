import * as React from "react";
import { authContext } from "../app.jsx";

const api_endpoint = window.internal.getAPIEndpoint;

// returns true if authenticated via admin
export async function login(auth) {
  const endpoint = "validate";
  const url = `${api_endpoint}/api/client/${endpoint}/`;

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      auth_session_id: auth,
    }),
    headers: { "Content-Type": "application/json" },
  });
  const json = await response.json();
  return json.success === 1;
}

// returns true if admin successfully deactivated your admin_key
export async function logout(auth) {
  setAuth(null);
  const endpoint = "logout";
  const url = `${api_endpoint}/api/client/${endpoint}/`;

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      auth_session_id: auth,
    }),
    headers: { "Content-Type": "application/json" },
  });
  const json = await response.json();
  return json.success === 1;
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
