import * as React from "react";
import { Alert, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

/**
 *
 * @param {object} props
 * @param {string} props.text - the text to display
 * @param {boolean} props.refreshButton - whether or not to display the refresh button
 * @returns an MUI alert that displays the error message given
 * @param {boolean} props.success - whether to display error icon or success
 */
export function DisplayError({ refreshButton, severity, text }) {
  const navigate = useNavigate();

  return (
    <>
      <Alert
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
        }}
        severity={severity ? severity : "error"}
        action={
          refreshButton && (
            <Button
              color="secondary"
              variant="text"
              onClick={(e) => window.location.reload()}>
              Try again
            </Button>
          )
        }>
        {text}
        {/* load refresh button if props.refreshButton === true */}
        <div className=""></div>
      </Alert>
    </>
  );
}
