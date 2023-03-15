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
import { getUniquePicoID } from "../hooks/auth";

const moves = [
  "forward",
  "back",
  "left",
  "right",
  "up",
  "down",
  "clockwise",
  "counter-clockwise",
];

const picObj = {
  up: up,
  down: down,
  left: left,
  right: right,
};

export function Sensor() {
  const [sensor, setSensor] = React.useState(
    _.sample(moves, 3) // initialize sensor with randomized moves
  );
  const navigate = useNavigate();
  const [session, setSession] = React.useContext(sessionContext);
  const [auth, setAuth] = React.useContext(authContext);
  const [pico_id, setPico_id] = React.useState(getUniquePicoID(crypto.randomUUID()));
  // generate random pico_id by paging API

  // TODO send matt a pico_id

  return (
    <>
      <h1>Move your sensor!</h1>
      <h3>Additionally, add these moves to the end of your sequence: {sensor}</h3>
      <Pictures sensor={sensor} />
      <form
        onSubmit={(event) => {
          handleSubmit(event, {
            endpoint: "motion_pattern/initialize",
            data: sensor,
            navigate: navigate,
            session: session,
            pico_id: pico_id,
          });
        }}
      >
        <input type="submit" value="Start" />
      </form>
      <Backdoor />
    </>
  );
}

function Pictures(props) {
  const sensor = props.sensor;
  // let components = [];
  // for (let motion of sensor) {
  //   let pic = () => {
  //     return (
  //       <>
  //         <img src={_.get(picObj, motion)} />
  //       </>
  //     );
  //   };
  //   components.push({ pic });
  // }
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
