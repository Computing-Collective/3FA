import * as React from "react";
import { authContext } from "../app.jsx";

export function login(key) {
  return (key) => {
    setAuth(key);
  };
}

export async function logout() {
  const [auth, setAuth] = React.useContext(authContext);
  return async () => {
    setAuth(null);
    // TODO send to logout API
  };
}
