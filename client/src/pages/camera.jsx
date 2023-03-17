import * as React from "react";
import { handleSubmit } from "../hooks/handleSubmit";
import { useLocation, useNavigate } from "react-router-dom";
import { Backdoor } from "./backdoor.jsx";
import { sessionContext, authContext } from "../app.jsx";
import { Stream } from "../components/Stream.jsx";

export function Camera() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [session, setSession] = React.useContext(sessionContext);
  const [auth, setAuth] = React.useContext(authContext);
  const [stream, setStream] = React.useState(null);

  return (
    <>
      <h1>Smile for the camera</h1>

      <Stream />
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
