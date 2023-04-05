import { Button } from "@mui/material";
import React from "react";
import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";

/**
 *
 * @returns the error page which redirects the user to home
 */
export function ErrorPage() {
  let text = "Something went wrong";
  const navigate = useNavigate();
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      text = "This page doesn't exist!";
    }

    if (error.status === 401) {
      text = "You aren't authorized to see this";
    }

    if (error.status === 500) {
      text =
        "Looks like our API encountered an issue. Please kindly report the issue to our support team";
    }
  }

  return (
    <>
      <div className="flex h-full min-h-screen flex-col items-center justify-center p-2">
        {text}
        <Button color="primary" variant="contained" onClick={() => navigate("/")}>
          Go back to home
        </Button>
      </div>
    </>
  );
}
