import * as React from "react";

const sessionContext = React.createContext("");

export default function sessionConsumer() {
  return React.useContext(sessionContext);
}
