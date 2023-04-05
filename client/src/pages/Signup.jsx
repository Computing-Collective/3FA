import React, { useState } from "react";
import { Backdoor } from "./Backdoor.jsx";
import { Select, MenuItem, Button, IconButton, Typography } from "@mui/material";
import { InputField } from "../components/InputField.jsx";
import { Remove, Add } from "@mui/icons-material";
import { HoverCheckbox } from "../components/HoverCheckbox.jsx";
import { Video } from "../components/Video.jsx";
import { DisplayError } from "../components/DisplayError.jsx";
import { useNavigate } from "react-router-dom";

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
  const [patterns, setPatterns] = useState([
    { id: crypto.randomUUID(), direction: "UP" },
  ]);
  const navigate = useNavigate();

  async function handleSignup(props) {
    const api_endpoint = window.internal.getAPIEndpoint;
    const motion_payload = patterns.map((obj, i) => {
      return obj.direction;
    });

    // follows the same format as in Postman
    // {
    //   "email": "llj-email@email.com",
    //   "password": "Password1",
    //   "motion_pattern": ["LEFT", "RIGHT", "UP", "DOWN"],
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
        motion_pattern: motion_payload,
        auth_methods: authMethods,
      })
    );
    formData.append("photo", photo);

    const response = await fetch(`${api_endpoint}/api/signup/`, {
      method: "POST",
      body: formData,
    });
    const json = await response.json();
    if (json.success === 0) {
      setError(json.msg);
      
    } else {
      navigate("/");
    }
  }

  return (
    <div className="flex flex-col pt-36 text-center">
      {error !== "" && <DisplayError text={error} />}
      <h1>Enter your email, password, and other information</h1>
      <form
        className="flex flex-col items-center"
        onSubmit={async (event) => {
          event.preventDefault();
          await handleSignup(); // also navigates
        }}>
        <div className="m-2 w-7/10 gap-y-2">
          <InputField
            autoFocus
            placeholder="Email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            type="email"
          />
        </div>
        <div className="m-2 w-3/5 gap-y-2">
          <InputField
            placeholder="Password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            type="password"
          />
        </div>
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
        {authMethods.motion_pattern && (
          <MotionPattern patterns={patterns} setPatterns={setPatterns} />
        )}
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
          <>
            <Video
              setText={setError}
              onCapture={(blob) => {
                setPhoto(blob);
              }}
              onClear={() => {
                setPhoto(null);
              }}
            />
          </>
        )}
        <div className="m-2 gap-y-2">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </div>
  );
}

function SelectMotionPattern({ index, patterns, setPatterns }) {
  return (
    <>
      <Select
        defaultValue="UP"
        // size="small"
        onChange={(event) => {
          const tempPatterns = [...patterns];
          tempPatterns[index].direction = event.target.value;
          setPatterns(tempPatterns);
        }}
        value={patterns[index].direction}
        autoWidth
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
        <MenuItem sx={{ color: "white" }} value="UP">
          Up
        </MenuItem>
        <MenuItem sx={{ color: "white" }} value="DOWN">
          Down
        </MenuItem>
        <MenuItem sx={{ color: "white" }} value="LEFT">
          Left
        </MenuItem>
        <MenuItem sx={{ color: "white" }} value="RIGHT">
          Right
        </MenuItem>
        <MenuItem sx={{ color: "white" }} value="FORWARD">
          Front
        </MenuItem>
        <MenuItem sx={{ color: "white" }} value="BACKWARD">
          Back
        </MenuItem>
        <MenuItem sx={{ color: "white" }} value="FLIP">
          Flip
        </MenuItem>
      </Select>
    </>
  );
}

/**
 *
 * @param {array} patterns the state to update with the selected motion pattern
 * contains an object {
 *  id: crypto.randomUUID(),
 *  direction: "UP" | "DOWN" | "LEFT" | "RIGHT" | "FORWARD" | "BACKWARD" | "FLIP"
 * }
 * @param {function} setPatterns the state updater for the state above ^
 * @returns a list of dropdowns for the user to select their motion pattern
 */
function MotionPattern({ patterns, setPatterns }) {
  // the dropdown for user selection (jsx component)

  return (
    <div className="flex w-full max-w-lg flex-row py-3">
      <div className="flex flex-row items-center justify-center align-middle">
        <NumberButton
          disabled={patterns.length < 2}
          onClick={() => {
            const tempPatterns = [...patterns];
            tempPatterns.pop();
            setPatterns(tempPatterns);
          }}>
          <Remove />
        </NumberButton>
        <span className="self-center">
          <Typography fontWeight="md">{patterns.length}</Typography>
        </span>
        <NumberButton
          disabled={patterns.length > 3}
          onClick={() => {
            setPatterns([...patterns, { id: crypto.randomUUID(), direction: "UP" }]);
          }}>
          <Add />
        </NumberButton>
      </div>
      <div className="grid flex-1 grid-cols-4 gap-4 lg:grid-cols-4">
        {patterns.map((pattern, index) => {
          return (
            <div key={pattern.id} className="self-center text-white">
              <SelectMotionPattern
                index={index}
                patterns={patterns}
                setPatterns={setPatterns}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 *
 * @param {function} onClick the onClick for the button
 * @param {function} disabled the conditions for the button to be disabled
 * @param {JSX.Element} children the children for the component
 * @returns a wrapper for the number button
 */
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
