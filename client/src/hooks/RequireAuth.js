import * as React from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { authContext } from "../app.jsx";
import { login } from "./auth.js";

// wrapper around routes that require authentication (i.e. /vault)
export function RequireAuth({ children }) {
  const [auth, setAuth] = React.useContext(authContext);

  console.log("requireAuth: " + auth);

  const [authed, setAuthed] = React.useState(false);

  // whenever auth modifies, check if the user is authenticated
  React.useEffect(() => {
    async function getAuthedStatus() {
      setAuthed(await login(auth));
    }
    getAuthedStatus();
  }, [auth]);

  console.log("authed: " + authed);
  return authed === true ? (
    children
  ) : (
    <Navigate to="/" replace state={{ path: location.pathname }} />
  );
}
