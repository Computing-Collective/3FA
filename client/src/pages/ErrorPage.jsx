import { Button } from "@mui/material";
import React from "react";
import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";

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
      text = "Looks like our API is down";
    }
  }

  return (
    <>
      <div className="flex flex-col">
        {text}
        <Button color="primary" variant="contained" onClick={() => navigate("/")}>
          Go back to home
        </Button>
      </div>
    </>
  );
}
