import * as React from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { authContext } from "../app.jsx";
import { login } from "./auth.js";

export function RequireAuth({ children }) {
  const [auth, setAuth] = React.useContext(authContext);
  console.log("requireAuth: " + auth);
  const authed = login(auth);

  console.log("authed: " + authed);
  return authed === true ? (
    children
  ) : (
    <Navigate to="/" replace state={{ path: location.pathname }} />
  );
}
