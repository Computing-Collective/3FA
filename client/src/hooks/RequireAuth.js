import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { authContext } from "../app.jsx";

export function RequireAuth({ children }) {
  const [auth, setAuth] = useContext(authContext);
  const location = useLocation();

  return authed === true ? (
    children
  ) : (
    <Navigate to="/vault" replace state={{ path: location.pathname }} />
  );
}
