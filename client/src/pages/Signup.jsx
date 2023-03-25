import { Button, Checkbox, Select, Option, IconButton, Typography } from "@mui/joy";
import React, { cloneElement, useState, useRef } from "react";
import { Done } from "@mui/icons-material";
import { Backdoor } from "./Backdoor.jsx";
import { InputField } from "../components/InputField.jsx";
import { Remove, Add } from "@mui/icons-material";

export function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [motionPattern, setMotionPattern] = useState([]);
  const [authMethods, setAuthMethods] = useState({
    password: true,
    motion_pattern: false,
    face_recognition: false,
  });
  let motionCount = 0;

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
    formData.append("email", email);
    formData.append("password", password);
    formData.append("auth_methods", authMethods);
    formData.append("motion_pattern", motionPattern);

    const response = await fetch(`${api_endpoint}/api/login/${endpoint}/`, {
      method: "POST",
      body: formData,
    });
  }
  return (
    <>
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
        />
        <InputField
          placeholder="Password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
        />
        {authMethods.motion_pattern && <MotionPattern />}
        <HoverCheckbox
          label="Password"
          value={authMethods.password}
          onChange={(event) => {
            setAuthMethods({ ...authMethods, password: event.target.checked });
          }}
          defaultChecked
        />
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
      </form>
      <Backdoor />
    </>
  );
}

function HoverCheckbox(props) {
  return (
    <Checkbox
      uncheckedIcon={<Done />}
      label={props.label}
      onChange={props.onChange}
      slotProps={{
        root: ({ checked, focusVisible }) => ({
          sx: !checked
            ? {
                "& svg": { opacity: focusVisible ? 0.32 : 0 },
                "&:hover svg": {
                  opacity: 0.32,
                },
              }
            : undefined,
        }),
      }}
      defaultChecked={props.defaultChecked}
    />
  );
}

function MotionPattern(props) {
  const [count, setCount] = useState(1); // the displayed number
  const motionPatternsRef = useRef([<SelectMotionPattern />]); // a list of selection dropdowns
  let keyCount = 0; // used for unique keys for components
  return (
    <>
      <IconButton
        size="sm"
        variant="outlined"
        disabled={count < 2}
        onClick={() => {
          setCount((c) => c - 1);
          motionPatternsRef.current.pop(<SelectMotionPattern />);
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
          motionPatternsRef.current.push(<SelectMotionPattern />);
        }}>
        <Add />
      </IconButton>
      {motionPatternsRef.current.map(() => {
        return <SelectMotionPattern key={keyCount++} />;
      })}
    </>
  );
}

function SelectMotionPattern(props) {
  return (
    <>
      <Select defaultValue="UP">
        <Option value="UP">Up</Option>
        <Option value="DOWN">Down</Option>
        <Option value="LEFT">Left</Option>
        <Option value="RIGHT">Right</Option>
        <Option value="FORWARD">Forward</Option>
        <Option value="BACKWARD">Backward</Option>
      </Select>
    </>
  );
}
