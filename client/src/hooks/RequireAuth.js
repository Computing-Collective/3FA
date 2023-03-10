import { useLocation } from "react-router-dom";

export function RequireAuth({ children }) {
  const { authed } = useAuth();
  const location = useLocation();

  return authed === true ? (
    children
  ) : (
    <Navigate to="/vault" replace state={{ path: location.pathname }} />
  );
}
