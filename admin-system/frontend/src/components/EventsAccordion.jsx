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

/**
 * 
 * @param {array} session the session returned from the admin backend follows this format:
    "sessions": [
        {
            "auth_stages": "{\"password\": true, \"motion_pattern\": true, \"face_recognition\": true}",
            "date": "29/03/2023 23:18:10",
            "login_photo": "b''",
            "motion_added_sequence": "[\"UP\", \"DOWN\", \"RIGHT\"]",
            "motion_completed": true,
            "session_id": "72fe10be-dead-4011-b61b-d44b1496974a",
            "user_email": "user@email.com",
            "user_id": "693e2954-6eb8-4ec6-8906-7b984e06e32e"
        },
        {
            "auth_stages": "{\"password\": true, \"motion_pattern\": true, \"face_recognition\": true}",
            "date": "29/03/2023 22:14:11",
            "login_photo": "b''",
            "motion_added_sequence": "[\"UP\", \"DOWN\", \"RIGHT\"]",
            "motion_completed": true,
            "session_id": "868643d8-cc42-425b-92dc-a17ad11ffd37",
            "user_email": "user@email.com",
            "user_id": "693e2954-6eb8-4ec6-8906-7b984e06e32e"
        },
      ]
  * @param {boolean} failedEvents whether to display the failed events button or not
 * @returns an mui accordion for events which displays information
 */
export function EventsAccordion({ session, failedEvents }) {
  const auth_methods = JSON.parse(session.auth_stages);
  const all_true = _.values(auth_methods).every((elem) => elem === true);

  return (
    <Accordion
      key={session.session_id}
      sx={{
        minWidth: "50%",
      }}>
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
          <div className="mx-5">{session.user_email || session.event}</div>
          {failedEvents ? ( // only render checkboxes if failedEvents is true
            all_true ? (
              <CheckBox color="success" />
            ) : (
              <Error color="error" />
            )
          ) : null}
        </AccordionSummary>
      </div>
      <AccordionDetails>
        <div className="grid grid-cols-1">
          {failedEvents // only render name and checkbox if failedEvents is true
            ? _.map(auth_methods, (passed, method) => {
                return (
                  <div key={method} className="text-black flex flex-row">
                    {mapMethod(method)} {":"}
                    <div className="flex-grow" />
                    {passed ? <CheckBox color="success" /> : <Error color="error" />}
                  </div>
                );
              })
            : null}
          {auth_methods.face_recognition ? (
            <>
              <div className="mx-auto w-1/2 m-2">
                {failedEvents ? "Successful photo" : "Failed photo"}
                <img src={binaryToBase64(session.photo)} />
              </div>
            </>
          ) : null}
        </div>
        {failedEvents && <FailedEvents session={session} />}
      </AccordionDetails>
    </Accordion>
  );
}

function binaryToBase64(binary) {
  let dataURL = "data:image/jpeg;base64," + binary;
  return dataURL;
}

/**
 *
 * @param {string} method the method to map
 * @returns the string with _'s replaced with ' ' and the first letter capitalized
 */
function mapMethod(method) {
  const no_space = method.replace("_", " ");
  const cap = no_space[0].toUpperCase() + no_space.substr(1);
  return cap;
}
