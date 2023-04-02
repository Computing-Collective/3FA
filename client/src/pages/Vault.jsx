import * as React from "react";
import { useContext, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { authContext } from "../app.jsx";
import { logout } from "../functions/auth.js";
import { Backdoor } from "./Backdoor.jsx";
import { Button, Typography } from "@mui/material";
import { Event, LocalConvenienceStoreOutlined } from "@mui/icons-material";
import { UploadButton } from "../components/UploadButton.jsx";
import { DisplayError } from "../components/DisplayError.jsx";
import { useEffect } from "react";
const api_endpoint = window.internal.getAPIEndpoint;

/**
 *
 * @returns the vault page
 */
export function Vault() {
  const navigate = useNavigate();
  const [auth, setAuth] = useContext(authContext);
  // the error text
  const [error, setError] = useState("");
  // whether to render the alert message as success or not
  const [success, setSuccess] = useState("");
  // an array of preview objects
  const [previews, setPreviews] = useState([]);

  // dummy variable to refresh the previews whenever something is uploaded (anti-pattern?)
  const [refresh, setRefresh] = useState();

  // re-fetch the preview data whenever {refresh} updates
  useEffect(() => {
    async function fetchData() {
      const previewJson = await getPreviewJson(auth);
      const previewData = mapPreview(previewJson, auth, setSuccess, setError, setRefresh);
      setPreviews(previewData);
    }
    fetchData();
  }, [refresh]);

  return (
    <>
      {/* hardcoded code hf */}
      <div className="absolute left-8 top-8 h-16 w-16">
        <Button
          color="primary"
          variant="contained"
          onClick={() => logout(auth, setAuth, navigate)}>
          Logout
        </Button>
      </div>
      {error !== "" && <DisplayError text={error} success={success} />}
      <div className="m-2 grid grid-cols-4 gap-3">
        <div className="col-span-3">
          <h1>Welcome to your secure vault</h1>
        </div>
        <div className="justify-self-end">
          <UploadButton
            auth={auth}
            setError={setError}
            setSuccess={setSuccess}
            setRefresh={setRefresh}
          />
        </div>
        {previews.length === 0 ? "No files uploaded" : previews}
      </div>
    </>
  );
}

/**
 *
 * @param {string} fileName the fileName
 * @param {Date} date the date for the file
 * @param {string} size the size of the file
 * @returns a jsx element for a file
 */
function Preview({ fileName, date, size, id, auth, setSuccess, setError, setRefresh }) {
  async function handleDelete(id, auth) {
    const response = await fetch(`${api_endpoint}/api/client/files/delete`, {
      body: JSON.stringify({
        auth_session_id: auth,
        file_id: id,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const json = await response.json();
    setSuccess(json.success); // set the type of alert that pops up
    setError(json.msg); // display success / err msg
    setRefresh(json.msg); // refresh the previews
  }
  return (
    <>
      <div className="col-span-4 flex flex-row bg-gray-600">
        <div className="m-3 self-center pr-3">
          <Typography>{fileName}</Typography>
        </div>
        <div className="m-2 grid grid-rows-2 gap-2 text-sm">
          <Event />
          {date}
          <div className="col-span-2">{humanFileSize(size)}</div>
        </div>
        <div className="flex-grow" />
        <div className="m-2 self-center">
          <Button
            onClick={async (e) => {
              e.preventDefault();
              await handleDelete(id, auth);
            }}>
            Delete
          </Button>
          <Button
            onClick={async (e) => {
              e.preventDefault();
              await handleDownload(id, auth, fileName);
            }}>
            Download
          </Button>
        </div>
      </div>
    </>
  );
}

/**
 *
 * @param {string} id the file id to download
 * @param {string} auth the auth session id
 * @param {string} fileName the fileName for the file to download
 */
async function handleDownload(id, auth, fileName) {
  const path = await window.internal.openFile(); // prompts the user to select a directory to place the donload in
  const response = await fetch(`${api_endpoint}/api/client/files/download/`, {
    body: JSON.stringify({
      auth_session_id: auth,
      file_id: id,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const file = await response.arrayBuffer();
  // saves the file to file/path with fileName
  window.internal.saveFile(file, path, fileName);
}

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize(bytes, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + " " + units[u];
}

/**
 * @param {object} json an object in the following form (returned from useLoader())
 * {
 * json: [
 *   {
 *     date: "2023-03-29 22:50:13",
 *     file_name: "picture",
 *     file_type: "image/jpeg",
 *     id: "aa35b09c-ddec-425f-acf4-442ead625aeb",
 *     size: 1859839,
 *   },
 *   {
 *     date: "2023-03-29 22:50:24",
 *     file_name: "picture2",
 *     file_type: "image/jpeg",
 *     id: "7093be37-dd7e-48e4-b0bd-33da2731eb4b",
 *     size: 1397795,
 *   },
 * ],
 * msg: "File fetch successful.",
 * success: 1,
 * }
 * @returns {array} an array of {Preview} elements to render
 */
function mapPreview(json, auth, setSuccess, setError, setRefresh) {
  const res = [];

  for (let file of json) {
    const preview = (
      <Preview
        key={file.id}
        fileName={file.file_name}
        date={file.date}
        size={file.size}
        id={file.id}
        auth={auth}
        setSuccess={setSuccess}
        setError={setError}
        setRefresh={setRefresh}
      />
    );
    res.push(preview);
  }
  return res;
}

/**
 *
 * @param {string} auth the auth_session_id token
 * @returns a json return from the admin-dashboard. used in mapPreview
 */
async function getPreviewJson(auth) {
  const response = await fetch(`${api_endpoint}/api/client/files/list/`, {
    method: "POST",
    body: JSON.stringify({
      auth_session_id: auth,
    }),
    headers: { "Content-Type": "application/json" },
  });
  const json = await response.json();
  return json.json;
}
