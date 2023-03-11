import * as React from "react";
import { handleSubmit } from "../hooks/handleSubmit";
import { useLocation, useNavigate } from "react-router-dom";
import { Backdoor } from "./backdoor.jsx";
import { sessionContext } from "../app.jsx";

export function Email() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [session, setSession] = React.useContext(sessionContext);

  return (
    <>
      <h1>Enter your Email</h1>
      <form
        onSubmit={(event) => {
          handleSubmit(event, {
            endpoint: "email",
            data: email,
            navigate: navigate,
            session: session,
            setSession: setSession,
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
