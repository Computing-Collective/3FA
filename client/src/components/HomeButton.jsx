import React from "react";
import { Home } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function HomeButton() {
  const navigate = useNavigate();
  return (
    <>
      <div className="absolute left-8 top-8 h-16 w-16">
        <IconButton
          aria-label="Home"
          onClick={() => {
            navigate("/");
          }}
          color="primary">
          <Home />
        </IconButton>
      </div>
    </>
  );
}
