import * as React from "react";
import { handleSubmit } from "../hooks/handleSubmit";
// import { useAuth } from "../hooks/useAuth";

export function Lock() {
  const [password, setPassword] = React.useState("");
  // const { login } = useAuth();

  return (
    <>
      <h1>Enter your password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type="submit" value="Submit" />
      </form>
    </>
  );
}
