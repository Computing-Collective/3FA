import * as React from "react";
import { useNavigate } from "react-router-dom";
import { handleSubmit } from "../hooks/handleSubmit";
import { sessionContext } from "../app.jsx";
import { Backdoor } from "./backdoor.jsx";

export function Lock() {
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();
  const [session, setSession] = React.useContext(sessionContext);

  return (
    <>
      <h1>Enter your password</h1>
      <form
        onSubmit={(event) => {
          handleSubmit(event, { endpoint: "email", data: password, navigate: navigate });
        }}
      >
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type="submit" value="Submit" />
      </form>
      <Backdoor />
    </>
  );
}
