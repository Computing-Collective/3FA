import * as React from "react";
import { useNavigate } from "react-router-dom";

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

/**
 * deactivates your auth key and navigates you to '/' (home)
 * @param {} auth auth key to deactivate
 * @param {*} setAuth function required to rm
 */
export async function logout(auth, setAuth, navigate) {
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
  navigate("/");
}

// pages api and returns a unique pico_id in ref to the admin
export async function getUniquePicoID(pico_id) {
  const endpoint = "motion_pattern/unique";
  const url = `${api_endpoint}/api/login/${endpoint}/`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        pico_id: pico_id,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const json = response.json();
    if (!response.ok || json.success === 0) {
      return getUniquePicoID(crypto.randomUUID());
    }
  } catch (e) {
    return null;
  }

  return pico_id;
}
