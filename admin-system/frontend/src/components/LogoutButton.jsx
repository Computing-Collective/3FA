import { useContext } from "react";
import { logout } from "../functions/auth";
import { Button } from "@mui/material";
import { authContext } from "../main";
import { useNavigate } from "react-router-dom";

/**
 *
 * @returns a logout button that sends an API request to the backend which deactivates the authentication cookie
 */
export function LogoutButton() {
  const [auth, setAuth] = useContext(authContext);
  const navigate = useNavigate();
  return (
    <div className="absolute left-8 top-8 h-16 w-16">
      <Button
        color="primary"
        variant="contained"
        onClick={() => logout(auth, setAuth, navigate)}>
        Logout
      </Button>
    </div>
  );
}
