import * as React from "react";
import { useState } from "react";
import { Backdoor } from "./Backdoor.jsx";
import _, { map } from "underscore";
import up from "../../public/sensor/up.png";
import down from "../../public/sensor/down.png";
import left from "../../public/sensor/left.png";
import right from "../../public/sensor/right.png";
import forward from "../../public/sensor/forward.png";
import backward from "../../public/sensor/backward.png";
import flip from "../../public/sensor/flip.png";
import { getUniquePicoID } from "../functions/auth.js";
import { DisplayError } from "../components/DisplayError.jsx";
import { SubmitButton } from "../components/SubmitButton.jsx";
import { useEffect } from "react";

// the possible moves that the pico can use
const possMoves = ["Forward", "Backward", "Left", "Right", "Up", "Down", "Flip"];

// object that holds pictures
const picObj = {
  Up: up,
  Down: down,
  Left: left,
  Right: right,
  Forward: forward,
  Backward: backward,
  Flip: flip,
};

/**ab
 *
 * @returns the sensor page
 */
export function Sensor() {
  const [moves, setMoves] = useState(
    _.sample(possMoves, 2) // initialize sensor with randomized moves
  );
  // generate random pico_id by paging API
  const [pico_id, setPico_id] = useState();
  // text for displaying errors
  const [error, setError] = useState("");

  const [severity, setSeverity] = useState("success"); // severity for the alert

  useEffect(() => {
    getUniquePicoID(crypto.randomUUID()).then((res) => {
      setPico_id(res);
    });
  }, []);

  /**
   *
   * @param {number} index the index of the move (0, 1, 2)
   * @returns the move text AND the pictures of the moves (located in /public/icons)
   */
  function Picture({ index }) {
    return (
      <>
        <div className="self-center justify-self-end">{moves[index]}</div>
        <img alt={moves[index]} src={_.get(picObj, moves[index])} width="35" height="35" />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col text-center align-middle">
        {(error !== "" && (
          <DisplayError
            text={error}
            refreshButton={severity !== "info"}
            severity={severity}
          />
        )) ||
          (pico_id === null && (
            <DisplayError
              text="Unable to connect your motion sensor"
              refreshButton={severity !== "info"}
            />
          ))}
        <h1>Move your sensor!</h1>
        <h3>Additionally, add these moves to the end of your sequence: </h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-2 py-2">
          <Picture index={0} />
          <Picture index={1} />
          {/* <Picture index={2} /> */}
        </div>
        <SubmitButton
          endpoint={"motion_pattern/initialize"}
          data={moves}
          setError={setError}
          pico_id={pico_id}
          text="Start the sequence"
          setSeverity={setSeverity}
        />
      </div>
    </>
  );
}
