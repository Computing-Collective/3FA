import React from "react";

export function handleNextNavigation({ json, response, setError, setAuth, navigate }) {
  const next = json.next;
  const success = json.success;
  // retry api request
  if (success === 0 && next === undefined) {
    setError(json.msg); // change text for frontend
    return;
  }

  // go to vault
  if (response.ok && next === null) {
    // auth occurs within component
    setAuth(json.auth_session_id);
    return;
  }
  // name mangling between admin / client
  switch (next) {
    case "motion_pattern":
      navigate("/sensor");
      return;
    case "face_recognition":
      navigate("/camera");
      return;
  }
  // generally, want to go to next place directed by admin
  navigate(`/${json.next}`);
}
