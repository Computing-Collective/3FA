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
import { CheckBox, ErrorIcon } from "@mui/icons-material";
import { logout } from "../functions/auth.js";

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
  const [accordions, setAccordions] = useState();

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
      console.log(json);
      setAccordions(mapAccordions(json.sessions));
    }
    getLoginSessions();
  }, []);

  return (
    <>
      <div className="absolute left-8 top-8 h-16 w-16">
        <Button
          color="primary"
          variant="contained"
          onClick={() => logout(auth, setAuth, navigate)}>
          Logout
        </Button>
      </div>
      <h1>Welcome to the admin dashboard</h1>
      <div className="flex flex-col">
        {/* render the accordions */}
        {accordions ? accordions : "Loading data..."}
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
      <div key={session.id}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ width: "33%", flexShrink: 0 }}>{session.date}</Typography>
            <Typography sx={{ color: "text.secondary" }}>{session.user_email}</Typography>
            {session.motion_completed ? (
              <CheckBox color="success" />
            ) : (
              <ErrorIcon color="error" />
            )}
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {"Authentication Methods:"} {auth_methods}
              auth_methods.motion_pattern ? ( {"Additional Motion Sequence:"})
              {session.motion_added_sequence}: {null}
              auth_methods.face_recognition ? ({"Login Photo:"} {session.login_photo}) :
              {null}
            </Typography>
            <Button
              onClick={async (e) => {
                e.preventDefault();
                handleShowFailed(auth, session.session_id);
              }}>
              Show Failed Events
            </Button>
          </AccordionDetails>
        </Accordion>
      </div>
    );
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
