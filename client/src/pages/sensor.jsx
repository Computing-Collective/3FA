import * as React from "react";
import { matchPath, useNavigate } from "react-router-dom";
import { handleSubmit } from "../hooks/handleSubmit";
import { authContext, sessionContext } from "../app.jsx";
import { Backdoor } from "./backdoor.jsx";
import _, { map } from "underscore";
import up from "../../public/icons/up.png";
import down from "../../public/icons/down.png";
import left from "../../public/icons/left.png";
import right from "../../public/icons/right.png";
// import forward from "../../public/icons/forward.png";
// import backward from "../../public/icons/backward.png";
// import flip from "../../public/icons/flip.png";
import { getUniquePicoID } from "../hooks/auth";
import { DisplayText } from "../components/DisplayText.jsx";

// TODO do this
const possMoves = [
  "forward",
  // "backward",
  // "left",
  // "right",
  // "up",
  // "down",
  // "flip"
];

const picObj = {
  up: up,
  down: down,
  left: left,
  right: right,
  // forward: forward,
  // backward: backward,
  // flip: flip,
};

export function Sensor() {
  const [moves, setMoves] = React.useState(
    _.sample(possMoves, 3) // initialize sensor with randomized moves
  );
  const navigate = useNavigate();
  const [session, setSession] = React.useContext(sessionContext);
  const [auth, setAuth] = React.useContext(authContext);
  // generate random pico_id by paging API
  const uid = getUniquePicoID(crypto.randomUUID());
  const [pico_id, setPico_id] = React.useState(uid);
  // text
  const [text, setText] = React.useState("");
  const submitButton = document.getElementById("submitButton");

  React.useEffect(() => {
    setText(""); // clear text on submit
  }, [submitButton]);

  // TODO send matt a pico_id

  return (
    <>
      <h1>Move your sensor!</h1>
      <h3>Additionally, add these moves to the end of your sequence: {moves}</h3>
      <Pictures sensor={moves} />
      <DisplayText text={text} />
      <form
        onSubmit={(event) => {
          handleSubmit(event, {
            endpoint: "motion_pattern/initialize",
            data: moves,
            navigate: navigate,
            session: session,
            pico_id: pico_id,
            setText: setText,
            auth: auth,
            setAuth: setAuth,
          });
        }}
      >
        <input id="submitButton" type="submit" value="Start" />
      </form>
      <Backdoor pico_id={pico_id} />
    </>
  );
}

function Pictures(props) {
  const sensor = props.sensor;
  let count = 0;
  return (
    <>
      {sensor.map((motion) => (
        <span key={count++}>
          <img src={_.get(picObj, motion)} />
        </span>
      ))}
    </>
  );
}
