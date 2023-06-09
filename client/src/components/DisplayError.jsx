import React, { useState } from "react";
import { Alert, Button, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Wrapper(props) {
  if (props.showModal) {
    return <Modal>{props.children}</Modal>;
  }
  return props.children;
}

/**
 *
 * @param {object} props
 * @param {string} props.text - the text to display
 * @param {boolean} props.refreshButton - whether to display the refresh button
 * @returns an MUI alert that displays the error message given
 * @param {boolean} props.success - whether to display error icon or success
 * @param {boolean} props.snackbar - whether to display as a snackbar or not
 */
export function DisplayError({ refreshButton, severity, text, setText, snackbar }) {
  const [open, setOpen] = useState(true);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setText("");
    setOpen(false);
  };

  if (snackbar === undefined) snackbar = false;

  const ConditionalWrapper = ({ condition, wrapper, children }) =>
    condition ? wrapper(children) : <>{children}</>;

  return (
    <>
      <ConditionalWrapper
        condition={snackbar}
        wrapper={(children) => (
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}>
            {children}
          </Snackbar>
        )}>
        <Alert
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
          }}
          severity={severity ? severity : "error"} // set default severity to error
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
        </Alert>
      </ConditionalWrapper>
    </>
  );
}
