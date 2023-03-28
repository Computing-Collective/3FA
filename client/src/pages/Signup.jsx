import React, { useState, useRef } from "react";
import { Backdoor } from "./Backdoor.jsx";
import { Select, MenuItem, Button, IconButton, Typography } from "@mui/material";
import { InputField } from "../components/InputField.jsx";
import { Remove, Add } from "@mui/icons-material";
import { HoverCheckbox } from "../components/HoverCheckbox.jsx";
import { Video } from "../components/Video.jsx";
import { DisplayError } from "../components/DisplayError.jsx";

/**
 *
 * @returns the main signup page
 */
export function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [authMethods, setAuthMethods] = useState({
    password: true,
    motion_pattern: false,
    face_recognition: false,
  });
  const selectRefs = useRef(["UP"]); // array of refs for each SelectMotionPattern component

  async function handleSignup(props) {
    const endpoint = "signup";
    const api_endpoint = window.internal.getAPIEndpoint;

    // follows the same format as in Postman
    // {
    //   "email": "llj-email@email.com",
    //   "password": "Password1",
    //   "motion_pattern": ["left", "RIGHT", "UP", "DOWN"],
    //   "auth_methods": {
    //       "password": true,
    //       "motion_pattern": true,
    //       "face_recognition": false
    //   }
    // }
    let formData = new FormData();
    formData.append(
      "request",
      JSON.stringify({
        email: email,
        password: password,
        motion_pattern: selectRefs.current,
        auth_methods: authMethods,
      })
    );
    formData.append("photo", photo);

    const response = await fetch(`${api_endpoint}/api/login/${endpoint}/`, {
      method: "POST",
      body: formData,
    });
    const json = await response.json();
    console.log(json);
  }
  return (
    <>
      <div className="flex flex-col justify-center text-center">
        {error !== "" && <DisplayError text={error} />}
        <h1>Enter your email, password, and other information</h1>
        <div className="m-2">
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              handleSignup();
            }}>
            <div className="flex flex-col gap-y-2">
              <InputField
                placeholder="Email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                type="email"
              />
              <InputField
                placeholder="Password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                type="password"
              />
            </div>
            <div className="flex flex-col justify-center">
              <HoverCheckbox
                label="Facial Recognition"
                onChange={(event) => {
                  setAuthMethods({
                    ...authMethods,
                    face_recognition: event.target.checked,
                  });
                }}
              />
              {/* render camera if needed */}
              {authMethods.face_recognition && (
                <Video
                  setText={setError}
                  onCapture={(blob) => {
                    setPhoto(blob);
                  }}
                  onClear={() => {
                    setPhoto(null);
                  }}
                />
              )}
              <HoverCheckbox
                label="Sensor"
                onChange={(event) => {
                  setAuthMethods({
                    ...authMethods,
                    motion_pattern: event.target.checked,
                  });
                }}
              />
              {/* render sensor dropdowns if needed */}
              {authMethods.motion_pattern && <MotionPattern selectRefs={selectRefs} />}
              <Button type="submit">Submit</Button>
            </div>
          </form>
          <Backdoor />
        </div>
      </div>
    </>
  );
}

/**
 *
 * @param {object} selectRefs the refs to update in the higher order component to update with the selected motion pattern ex: "UP", "DOWN", "LEFT", "RIGHT", "FORWARD", "BACKWARD", "FLIP
 * @returns a list of dropdowns for the user to select their motion pattern
 */
function MotionPattern({ selectRefs }) {
  const [count, setCount] = useState(1); // the displayed number
  const motionPatternsRef = useRef([0]); // a list of 0s used to render a variable amount of select motion patterns
  const motionPatterns = [];

  for (let i = 0; i < count; i++) {
    motionPatterns.push(
      <div className=" self-center">
        <SelectMotionPattern key={i} index={i} />
      </div>
    );
  }

  // the dropdown for user selection (jsx component)
  function SelectMotionPattern({ index }) {
    return (
      <>
        <Select
          defaultValue="UP"
          // size="small"
          onChange={(event) => {
            selectRefs.current[index] = event.target.value;
            // TODO buggy behaviour on new
          }}
          sx={{
            color: "white",
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: "white",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
            },
            ".MuiSvgIcon-root": {
              fill: "white",
            },
          }}>
          <MenuItem value="UP">Up</MenuItem>
          <MenuItem value="DOWN">Down</MenuItem>
          <MenuItem value="LEFT">Left</MenuItem>
          <MenuItem value="RIGHT">Right</MenuItem>
          <MenuItem value="FORWARD">Forward</MenuItem>
          <MenuItem value="BACKWARD">Backward</MenuItem>
          <MenuItem value="FLIP">Flip</MenuItem>
        </Select>
      </>
    );
  }

  return (
    <>
      <div className="grid grid-flow-col grid-cols-5 gap-x-5">
        <div className="">
          <NumberButton
            disabled={count < 2}
            onClick={() => {
              setCount((c) => c - 1);
              motionPatternsRef.current.pop(0);
              selectRefs.current.pop();
            }}>
            <Remove />
          </NumberButton>
          <Typography fontWeight="md">{count}</Typography>
          <NumberButton
            disabled={count > 3}
            onClick={() => {
              setCount((c) => c + 1);
              motionPatternsRef.current.push(0);
              selectRefs.current.push("UP");
            }}>
            <Add />
          </NumberButton>
        </div>
        {motionPatterns}
      </div>
    </>
  );
}

function NumberButton({ onClick, disabled, children }) {
  return (
    <>
      <div className="flex flex-row justify-center">
        <IconButton
          size="sm"
          variant="outlined"
          disabled={disabled}
          onClick={onClick}
          sx={{
            color: "white",
            "&:hover": {
              backgroundColor: "transparent",
            },
            "&:disabled": {
              color: "gray",
            },
          }}>
          {children}
        </IconButton>
      </div>
    </>
  );
}
