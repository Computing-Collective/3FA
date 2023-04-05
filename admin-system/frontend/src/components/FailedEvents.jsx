import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { authContext } from "../main";
import { EventsAccordion } from "./EventsAccordion";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

/**
 *
 * @param {object} session the session to display failed events from (follows format as specified in EventsAccordion)
 * @returns failed events accordion fetched from the admin backend
 */
export function FailedEvents({ session }) {
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useContext(authContext);
  const [events, setEvents] = useState(null);

  const handleClickOpen = async () => {
    setOpen(true);
    // get data
    const response = await fetch(
      `${API_ENDPOINT}/api/dashboard/failed_events/?session_id=${session.session_id}`,
      {
        method: "POST",
        body: JSON.stringify({
          auth_session_id: auth,
        }),
        headers: { "Content-Type": "application/json" },
      }
    );
    const json = await response.json();
    if (json.events.length === 0) {
      setEvents("No failed events");
    } else {
      setEvents(mapEvents(json.events));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEvents(null);
  };

  return (
    <div>
      <Button
        variant="contained"
        onClick={async () => {
          await handleClickOpen();
        }}>
        Show Failed Events
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"Failed Events"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {events !== null ? events : "Loading data..."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function mapEvents(events) {
  const res = [];
  for (let event of events) {
    res.push(<EventsAccordion session={event} failedEvents={false} />);
  }
  return res;
}
