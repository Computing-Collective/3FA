import * as React from "react";
import { authContext } from "../app.jsx";

export function login(key) {
  return (key) => {
    // setAuth(key);
    // TODO send API req with auth, return true if ok.
  };
}

export async function logout() {
  const [auth, setAuth] = React.useContext(authContext);
  return async () => {
    setAuth(null);
    // TODO send to logout API and redirect user
  };
}

export async function getUniquePicoID(pico_id) {
  const endpoint = "motion_pattern/unique";
  const url = `${api_endpoint}/api/login/${endpoint}/`;

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      pico_id: pico_id,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const json = await response.json();
  if (!response.ok || json.success === 0) {
    return getUniquePicoID(crypto.randomUUID());
  }
  return pico_id;
}
