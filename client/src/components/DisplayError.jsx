import * as React from "react";
import { Alert, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function DisplayError(props) {
  const navigate = useNavigate();

  const handleRefresh = (event) => {};
  return (
    <>
      <Alert severity="error">
        {props.text}
        {/* load refresh button if props.refreshButton === true */}
        {props.refreshButton && (
          <Button variant="text" onClick={(e) => window.location.reload()}>
            Try again
          </Button>
        )}
      </Alert>
    </>
  );
}
