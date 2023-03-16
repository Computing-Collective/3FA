import * as React from "react";
import { handleSubmit } from "../hooks/handleSubmit";
import { useLocation, useNavigate } from "react-router-dom";
import { Backdoor } from "./backdoor.jsx";
import { sessionContext, authContext } from "../app.jsx";

export function Camera() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [session, setSession] = React.useContext(sessionContext);
  const [auth, setAuth] = React.useContext(authContext);

  return (
    <>
      <h1>Smile for the camera</h1>
      <form
        onSubmit={(event) => {
          window.api.captureImage();
        }}
      >
        <input type="submit" value="Capture" />
      </form>
      <form
        onSubmit={(event) => {
          handleSubmit(event, {
            endpoint: "camera",
            data: email,
            navigate: navigate,
            session: session,
            setSession: setSession,
            auth: auth,
            setAuth: setAuth,
          });
        }}
      >
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="submit" value="Submit" />
      </form>
      <Backdoor />
    </>
  );
}
