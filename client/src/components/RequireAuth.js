import * as React from "react";
import { useContext, useRef, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { authContext } from "../app.jsx";
import { login } from "../functions/auth.js";

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
  
  return authed.current === true ? (
    children
  ) : (
    <Navigate to="/" replace state={{ path: location.pathname }} />
  );
}
  