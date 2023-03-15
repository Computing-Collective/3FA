import * as React from "react";
import { useNavigate } from "react-router-dom";
import { handleSubmit } from "../hooks/handleSubmit";
import { authContext, sessionContext } from "../app.jsx";
import { Backdoor } from "./backdoor.jsx";
import { DisplayText } from "../components/DisplayText.jsx";

export function Password() {
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();
  const [session, setSession] = React.useContext(sessionContext);
  const [auth, setAuth] = React.useContext(authContext);
  const [text, setText] = React.useState("");
  const submitButton = document.getElementById("submitButton");

  React.useEffect(() => {
    setText(""); // clear text on submit
  }, [submitButton]);

  return (
    <>
      <h1>Enter your password</h1>
      <DisplayText text={text} />
      <form
        onSubmit={(event) => {
          handleSubmit(event, {
            endpoint: "password",
            data: password,
            navigate: navigate,
            session: session,
            auth: auth,
            setAuth: auth,
            setText: setText,
          });
        }}
      >
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input id="submitButton" type="submit" value="Submit" />
      </form>
      <Backdoor />
    </>
  );
}
