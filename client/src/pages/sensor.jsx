import * as React from "react";
import { useState } from "react";
import { Backdoor } from "./backdoor.jsx";
import _, { map } from "underscore";
import up from "../../public/icons/up.png";
import down from "../../public/icons/down.png";
import left from "../../public/icons/left.png";
import right from "../../public/icons/right.png";
import forward from "../../public/icons/forward.png";
import backward from "../../public/icons/backward.png";
import flip from "../../public/icons/flip.png";
import { getUniquePicoID } from "../functions/auth.js";
import { DisplayError } from "../components/DisplayError.jsx";
import { SubmitButton } from "../components/SubmitButton.jsx";

const possMoves = ["forward", "backward", "left", "right", "up", "down", "flip"];

const picObj = {
  up: up,
  down: down,
  left: left,
  right: right,
  forward: forward,
  backward: backward,
  flip: flip,
};

/**
 *
 * @returns the sensor page
 */
export function Sensor() {
  const [moves, setMoves] = useState(
    _.sample(possMoves, 3) // initialize sensor with randomized moves
  );
  // generate random pico_id by paging API
  const [pico_id, setPico_id] = useState(getUniquePicoID(crypto.randomUUID()));
  // text for displaying errors
  const [error, setError] = useState("");
  // TODO send matt a pico_id

  return (
    <>
      <h1>Move your sensor!</h1>
      <h3>Additionally, add these moves to the end of your sequence: {moves}</h3>
      {/* <Pictures sensor={moves} /> */}
      {error !== "" && <DisplayError text={error} refreshButton={true} />}
      <SubmitButton
        endpoint={"motion_pattern/initialize"}
        data={moves}
        setError={setError}
        pico_id={pico_id}
      />
      <Backdoor pico_id={pico_id} />
    </>
  );
}

/**
 *
 * @param {object} props
 * @param {array} props.sensor the array of moves to display -- declared as a global variable. ex: ["forward", "backward", "left"]
 * @returns the pictures of the moves (located in /public/icons)
 */
function Pictures(props) {
  // TODO fix the cropping on the pictures
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
