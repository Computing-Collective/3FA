import React from "react";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

/**
 *
 * @param {string} auth the auth token
 * @param {React.SetStateAction} setAuth sets the auth token
 * @param {function} navigate used to navigate the browser
 */
export async function logout(auth, setAuth, navigate) {
  setAuth(undefined);
  const url = `${API_ENDPOINT}/api/client/logout`;

  await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      auth_session_id: auth,
    }),
    headers: { "Content-Type": "application/json" },
  });
  navigate("/");
}
