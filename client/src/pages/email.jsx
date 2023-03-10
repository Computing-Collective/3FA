import * as React from "react";
import sessionConsumer from "../hooks/sessionAuth";
import { handleSubmit } from "../hooks/handleSubmit";

export function Email() {
  const [email, setEmail] = React.useState("");

  return (
    <>
      <h1>Enter your Email</h1>
      <form onSubmit={async () => handleSubmit({ endpoint: "initialize", data: email })}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="submit" value="Submit" />
      </form>
    </>
  );
}
