import React from "react";
import { handleNextNavigation } from "./handleNextNavigation";

const api_endpoint = window.internal.getAPIEndpoint;

/**
 * handler for submit button on camera page, sends API request to admin
 */
export async function handleCameraSubmit({ data, session, setError, setAuth, navigate, setSeverity }) {
  // the endpoint for face
  const endpoint = "face_recognition";
  // form because need to include img
  let formData = new FormData();
  formData.append("photo", data);
  formData.append(
    "request",
    JSON.stringify({
      session_id: session,
    })
  );
  // send api request with blob
  const response = await fetch(`${api_endpoint}/api/login/${endpoint}/`, {
    method: "POST",
    body: formData,
  });
  const json = await response.json();
  handleNextNavigation({ json, response, setError, setAuth, navigate, setSeverity });
}
