import * as React from "react";
import { authContext } from "../app.jsx";

const api_endpoint = window.internal.getAPIEndpoint;

// returns true if authenticated via admin
export function login(auth) {
  const endpoint = "validate";
  const url = `${api_endpoint}/api/client/${endpoint}/`;

  const reference = { success: false };
  fetch(url, {
    method: "POST",
    body: JSON.stringify({
      auth_session_id: auth,
    }),
    headers: { "Content-Type": "application/json" },
  }).then((response) => {
    response.json().then((json) => {
      reference.success = json.success === 1;
    });
  });

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(reference.success);
    }, 3000);
  });

  // let api_requests = 0;
  // const interval_id = setInterval(() => {
  //   if (api_requests++ > 5) {
  //     clearInterval(interval_id);
  //     return false;
  //   }
  //   clearInterval(interval_id);
  //   return reference.success;
  // }, 1000);
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
