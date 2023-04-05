import * as React from "react";
import { Alert, Button, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";

/**
 *
 * @param {object} props
 * @param {string} props.text - the text to display
 * @param {boolean} props.refreshButton - whether to display the refresh button
 * @returns an MUI alert that displays the error message given
 * @param {boolean} props.success - whether to display error icon or success
 * @param {boolean} props.snackbar - whether to display as a snackbar or not
 */
export function DisplayError({ refreshButton, severity, text, snackbar }) {
  const [open, setOpen] = React.useState(false);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  if (snackbar === undefined) snackbar = false;

  return (
    <>
      {snackbar ? (
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert
            onClose={handleClose}
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
        </Snackbar>
      ) : (
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
      )}
    </>
  );
}
