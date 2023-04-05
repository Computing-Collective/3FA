import { useLoaderData, useNavigate } from "react-router-dom";
import { Backdoor } from "../components/Backdoor.jsx";
import {
  Accordion,
  Button,
  AccordionSummary,
  Typography,
  AccordionDetails,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { authContext } from "../main.jsx";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AccessTime, CheckBox, Error, Event } from "@mui/icons-material";
import { LogoutButton } from "../components/LogoutButton.jsx";
import _ from "underscore";

const api_endpoint = import.meta.env.VITE_API_ENDPOINT;

export function Home() {
  // auth token
  const [auth, setAuth] = useContext(authContext);
  const navigate = useNavigate();
  /*
  accordion: {
    id (UUID): 1234,
    name: 'Bob',
    methods: {
      password: true,
      face_recognition: true,
      motion_pattern: false,
    }
    time: Date() ;
    success: true
    email: "bob@email.com"
  }
  */
  const [accordions, setAccordions] = useState(null);

  // fetch data and store in accordions on page load
  useEffect(() => {
    async function getLoginSessions() {
      const response = await fetch(`${api_endpoint}/api/dashboard/login_sessions/`, {
        method: "POST",
        body: JSON.stringify({
          auth_session_id: auth,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const json = await response.json();
      const accords = mapAccordions(json.sessions);
      setAccordions(accords);
    }
    getLoginSessions();
  }, []);

  return (
    <>
      <LogoutButton />
      <h1>Welcome to the admin dashboard</h1>
      <div className="flex flex-col">
        {/* render the accordions */}
        {accordions !== null ? accordions : "Loading data..."}
      </div>
      {import.meta.env.DEV && <Backdoor />}
    </>
  );
}

/**
 *
 * @param {[]} sessions an array of sessions returned from the /api/dashboard/login_sessions api
 * @returns an array of accordion elements
 */
function mapAccordions(sessions) {
  const res = [];
  for (let session of sessions) {
    const auth_methods = JSON.parse(session.auth_stages);
    res.push(
      <Accordion key={session.session_id}>
        <div className="items-center flex flex-row justify-center">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <span className="px-2">
              <Event />
            </span>
            {session.date.split(" ")[0]}
            <span className="px-2">
              <AccessTime />
            </span>
            {session.date.split(" ")[1]}
            <div className="mx-5">{session.user_email}</div>
            {session.motion_completed ? (
              <CheckBox color="success" />
            ) : (
              <Error color="error" />
            )}
          </AccordionSummary>
        </div>
        <AccordionDetails>
          <div className="grid grid-cols-1">
            {_.map(auth_methods, (passed, method) => {
              return (
                <div key={method} className="text-black flex flex-row">
                  {method.replace("_", " ")} {":"}
                  <div className="flex-grow" />
                  {passed ? <CheckBox color="success" /> : <Error color="error" />}
                </div>
              );
            })}
          </div>
          {auth_methods.face_recognition ? (
            <div className="w-1/2">
              <img src={binaryToBase64(session.login_photo)} />
            </div>
          ) : null}
          <Button
            onClick={async (e) => {
              e.preventDefault();
              handleShowFailed(auth, session.session_id);
            }}>
            Show Failed Events
          </Button>
        </AccordionDetails>
      </Accordion>
    );
    if (res.length === 5) break;
  }
  return res;
}

async function getFailedEvents() {
  const response = await fetch(`${api_endpoint}/api/dashboard/failed_events`, {
    method: "POST",
    body: JSON.stringify({
      auth_session_id: auth,
    }),
    headers: { "Content-Type": "applicaton/json" },
  });
  const json = await response.json();
  return json.events;
}

async function handleShowFailed(auth, session_id) {}

function binaryToBase64(binary) {
  console.log(binary);
  let byteArray = new Uint8Array(
    binary
      .split("\\x")
      .slice(1)
      .map((hex) => parseInt(hex, 16))
  );

  let blob = new Blob([byteArray], { type: "image/jpeg" });
  console.log(blob);
  return URL.createObjectURL(blob);
  const jpegString = binary.substring(2, binary.length - 1);
  let base64String = btoa(jpegString);
  let dataURL = "data:image/jpeg;base64," + base64String;
  console.log(dataURL);
  return dataURL;
}
