import { logout } from "../functions/auth";
import { Button } from "@mui/material";

export function LogoutButton() {
  <div className="absolute left-8 top-8 h-16 w-16">
    <Button
      color="primary"
      variant="contained"
      onClick={() => logout(auth, setAuth, navigate)}>
      Logout
    </Button>
  </div>;
}
