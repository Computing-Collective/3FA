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
import { FailedEvents } from "../components/FailedEvents.jsx";
import { EventsAccordion } from "../components/EventsAccordion.jsx";

const api_endpoint = import.meta.env.VITE_API_ENDPOINT;

export function Home() {
  // auth token
  const [auth, setAuth] = useContext(authContext);
  const navigate = useNavigate();
  const count = 20;
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
      const response = await fetch(
        `${api_endpoint}/api/dashboard/login_sessions/?count=${count}`,
        {
          method: "POST",
          body: JSON.stringify({
            auth_session_id: auth,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const json = await response.json();
      console.log(json);
      const accords = mapAccordions(json.sessions);
      setAccordions(accords);
    }
    getLoginSessions();
  }, []);

  return (
    <>
      <LogoutButton />
      <div className="flex h-full min-h-screen flex-col items-center justify-center p-2 pt-36">
        <h1>Welcome to the admin dashboard</h1>
        <div className="flex flex-col">
          {/* render the accordions */}
          {accordions !== null ? accordions : "Loading data..."}
        </div>
        {import.meta.env.DEV && <Backdoor />}
      </div>
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
    res.push(
      <EventsAccordion key={session.session_id} session={session} failedEvents={true} />
    );
  }
  return res;
}
