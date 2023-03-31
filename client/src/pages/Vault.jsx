import * as React from "react";
import { useContext, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { authContext } from "../app.jsx";
import { logout } from "../functions/auth.js";
import { Backdoor } from "./Backdoor.jsx";
import {
  Button,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Dialog,
  TextField,
  FormControl,
} from "@mui/material";
import { DisplayError } from "../components/DisplayError.jsx";

const api_endpoint = window.internal.getAPIEndpoint;
/**
 *
 * @returns the vault page
 */
export function Vault() {
  const navigate = useNavigate();
  const [auth, setAuth] = useContext(authContext);
  const [error, setError] = useState("");
  // an array of preview objects
  const [previews, setPreviews] = useState(useLoaderData().json);

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
      {error !== "" && <DisplayError text={error} />}
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-3">
          <h1>Welcome to your secure vault</h1>
        </div>
        <div className="">
          <FormDialog auth={auth} setError={setError} />
        </div>
        <Backdoor />
      </div>
    </>
  );
}

function Preview({ fileName, date, size }) {
  return (
    <>
      <div className="flex flex-row bg-gray-600">
        <Typography>{fileName}</Typography>
      </div>
    </>
  );
}

function FormDialog({ auth, setError }) {
  const [open, setOpen] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [fileName, setFileName] = useState("");
  console.log(filePath, fileName);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFilePath("");
    setFileName("");
  };

  async function handleUpload() {
    // fileName is required
    const file = window.internal.getFileData(filePath);
    console.log(file);

    let formData = new FormData();
    formData.append("file", file);
    formData.append(
      "request",
      JSON.stringify({
        auth_session_id: auth,
        file_name: fileName,
      })
    );
    const response = await fetch(`${api_endpoint}/api/dashboard/`, {
      method: "POST",
      body: formData,
    });
    const json = await response.json();
    setError(json.msg); // success :D
    setOpen(false);
  }

  const handleFilePath = async () => {
    const filePath = await window.internal.openFile();
    setFilePath(filePath);
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Upload
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle
          sx={{
            color: "white",
          }}>
          Upload
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              color: "white",
            }}>
            Upload your data and specify the filename
          </DialogContentText>

          <TextField
            required
            autoFocus
            margin="dense"
            id="name"
            label="Filename"
            fullWidth
            variant="standard"
            onChange={(e) => {
              setFileName(e.target.value);
            }}
            sx={{
              input: {
                color: "white",
              },
              "& label": {
                color: "white",
              },
              "&.MuiTextField-root": {
                fieldset: {
                  borderColor: "white",
                },
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />

          <Button aria-required onClick={handleFilePath}>
            {filePath === "" ? (
              "Choose file"
            ) : (
              <div className="text-xs font-normal text-white">{filePath}</div>
            )}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={async () => {
              handleUpload();
            }}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
