import * as React from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { authContext } from "../app.jsx";
import { login } from "./auth.js";

export function RequireAuth({ children }) {
  const auth = React.useContext(authContext); // str
  const authed = login(auth);

  return authed === true ? (
    children
  ) : (
    <Navigate to="/" replace state={{ path: location.pathname }} />
  );
}
