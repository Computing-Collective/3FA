import React from "react";

/**
 *
 * @param {string} auth the auth token
 * @param {React.SetStateAction} setAuth sets the auth token
 * @param {function} navigate used to navigate the browser
 */
export async function logout(auth, setAuth, navigate) {
  setAuth(null);
  const url = `${api_endpoint}/api/client/logout`;

  await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      auth_session_id: auth,
    }),
    headers: { "Content-Type": "application/json" },
  });
  navigate("/");
}
