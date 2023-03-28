import * as React from "react";
import { useState } from "react";
import { Backdoor } from "./Backdoor.jsx";
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

const possMoves = ["Forward", "Backward", "Left", "Right", "Up", "Down", "Flip"];

const picObj = {
  Up: up,
  Down: down,
  Left: left,
  Right: right,
  Forward: forward,
  Backward: backward,
  Flip: flip,
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

  /**
   *
   * @param {number} index the index of the move (0, 1, 2)
   * @returns the move text AND the pictures of the moves (located in /public/icons)
   */
  function Picture({ index }) {
    return (
      <>
        <div className="self-center">{moves[index]}</div>
        <img src={_.get(picObj, moves[index])} width="50" height="50" />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col text-center">
        <h1>Move your sensor!</h1>
        <h3>Additionally, add these moves to the end of your sequence: </h3>
        <div class="grid grid-cols-2 gap-2">
          <Picture index={0} />
          <Picture index={1} />
          <Picture index={2} />
        </div>
        {error !== "" && <DisplayError text={error} refreshButton={true} />}
        <SubmitButton
          endpoint={"motion_pattern/initialize"}
          data={moves}
          setError={setError}
          pico_id={pico_id}
          text="Start the sequence"
        />
        <Backdoor pico_id={pico_id} />
      </div>
    </>
  );
}
