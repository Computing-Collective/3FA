import * as React from "react";
import { useContext, useRef, useState } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { authContext } from "../app.jsx";
import { login } from "./auth.js";

// wrapper around routes that require authentication (i.e. /vault)
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
      console.log(authed.current);
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
