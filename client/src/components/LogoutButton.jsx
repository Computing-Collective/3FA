import React, { useContext } from "react";
import { Button } from "@mui/material";
import { logout } from "../functions/auth";
import { authContext } from "../app.jsx";
import { useNavigate } from "react-router-dom";

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
