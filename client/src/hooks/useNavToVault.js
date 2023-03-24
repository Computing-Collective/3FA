import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useNavToVault(auth) {
  // navigate to vault if auth is modified within handleSubmit()
  // but only do that when component is mounted (so it doesn't infinite loop)
  const isMounted = useRef(false);
  const navigate = useNavigate();

  const initNav = () => {
    if (auth !== null && isMounted.current) {
      navigate("/vault");
    } else {
      isMounted.current = true;
    }
  };
  return { initNav };
}
