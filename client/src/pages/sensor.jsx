import * as React from "react";
import { useState } from "react";
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
import { SubmitButton } from "../components/SubmitButton.jsx";

// TODO do this
const possMoves = ["forward", "backward", "left", "right", "up", "down", "flip"];

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
  const [moves, setMoves] = useState(
    _.sample(possMoves, 1) // initialize sensor with randomized moves
  );
  // generate random pico_id by paging API
  const uid = getUniquePicoID(crypto.randomUUID());
  const [pico_id, setPico_id] = useState(uid);
  // text for displaying errors
  const [text, setText] = useState("");
  // TODO send matt a pico_id

  return (
    <>
      <h1>Move your sensor!</h1>
      <h3>Additionally, add these moves to the end of your sequence: {moves}</h3>
      <Pictures sensor={moves} />
      <DisplayText text={text} />
      <SubmitButton
        endpoint={"motion_pattern/initialize"}
        data={moves}
        setText={setText}
        pico_id={pico_id}
      />
      <Backdoor pico_id={pico_id} />
    </>
  );
}

// component that displays the pictures
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
