import * as React from "react";
import { useContext, useRef, useState, useEffect } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { authContext } from "../main.jsx";
import { Outlet } from "react-router-dom";

/**
 * wrapper around routes that require authentication (i.e. /vault)
 * @param {object} props
 * @param {React.ReactNode} props.children - the children of the component
 * @returns a component that checks if the user is authenticated before rendering the children
 */
export function RequireAuth({ children }) {
  const [auth, setAuth] = useContext(authContext);
  // state that checks if the auth is checked (waiting for async function to finish)
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  const authed = useRef(false);

  // whenever auth modifies, check if the user is authenticated
  useEffect(() => {
    async function getAuthedStatus() {
      authed.current = await login(auth);
      setAuthChecked(true);
    }
    getAuthedStatus();
  }, []);

  //
  if (!authChecked) {
    return null;
  }

  authed.current = true;
  return authed.current === true ? children : navigate("/");
}

async function login(auth) {
  // TODO test
  const endpoint = "validate";
  const url = `${api_endpoint}/api/dashboard/${endpoint}/`;

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
