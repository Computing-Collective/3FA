import React, { useState, useRef } from "react";
import { Button, IconButton, Typography } from "@mui/joy";
import { Backdoor } from "./Backdoor.jsx";
import { Select, MenuItem } from "@mui/material";
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
  console.log(selectRefs);

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
      {error !== "" && <DisplayError text={error} />}
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          handleSignup();
        }}>
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
        {
          // TODO force user to use password?
          /* <HoverCheckbox
          label="Password"
          value={authMethods.password}
          onChange={(event) => {
            setAuthMethods({ ...authMethods, password: event.target.checked });
          }}
          defaultChecked
        /> */
        }
        <HoverCheckbox
          label="Facial Recognition"
          onChange={(event) => {
            setAuthMethods({ ...authMethods, face_recognition: event.target.checked });
          }}
        />
        <HoverCheckbox
          label="Sensor"
          onChange={(event) => {
            setAuthMethods({ ...authMethods, motion_pattern: event.target.checked });
          }}
        />
        <Button type="submit">Submit</Button>
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
        {/* render sensor dropdowns if needed */}
        {authMethods.motion_pattern && <MotionPattern selectRefs={selectRefs} />}
      </form>
      <Backdoor />
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
    motionPatterns.push(<SelectMotionPattern key={i} index={i} />);
  }

  // the dropdown for user selection (jsx component)
  function SelectMotionPattern({ index }) {
    return (
      <>
        <Select
          defaultValue="UP"
          onChange={(event) => {
            console.log(event.target.value, index);
            selectRefs.current[index] = event.target.value;
            console.log(selectRefs);
            // TODO buggy behaviour on new
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
      <IconButton
        size="sm"
        variant="outlined"
        disabled={count < 2}
        onClick={() => {
          setCount((c) => c - 1);
          motionPatternsRef.current.pop(0);
          selectRefs.current.pop();
        }}>
        <Remove />
      </IconButton>
      <Typography fontWeight="md">{count}</Typography>
      <IconButton
        size="sm"
        variant="outlined"
        disabled={count > 3}
        onClick={() => {
          setCount((c) => c + 1);
          motionPatternsRef.current.push(0);
          selectRefs.current.push("UP");
        }}>
        <Add />
      </IconButton>
      {motionPatterns}
    </>
  );
}
