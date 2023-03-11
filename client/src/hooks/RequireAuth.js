import * as React from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { authContext } from "../app.jsx";

export function RequireAuth({ children }) {
  const auth = React.useContext(authContext);
  const authed = login(auth);

  return auth === true ? (
    children
  ) : (
    <Navigate to="/" replace state={{ path: location.pathname }} />
  );
}
