import React, { useState } from "react";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Dialog,
  TextField,
} from "@mui/material";

const api_endpoint = window.internal.getAPIEndpoint;

/**
 *
 * @param {string} auth the auth_session_id
 * @param {React.SetStateAction} setError handler to setText in the error message component
 * @param {React.SetStateAction} setRefresh function to make a component refresh
 * @param {React.SetStateAction} setSuccess changes the type of alert
 * @returns a jsx upload button
 */
export function UploadButton({ auth, setError, setRefresh, setSuccess }) {
  const [open, setOpen] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [fileName, setFileName] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFilePath("");
    setFileName("");
    // tell the frontend to refetch the previews
    setRefresh(filePath);
  };

  async function handleUpload() {
    // fileName is required
    const file = await window.internal.getFileData(filePath);
    const blob = new Blob([file]);

    let formData = new FormData();
    formData.append("file", blob);
    formData.append(
      "request",
      JSON.stringify({
        auth_session_id: auth,
        file_name: fileName,
      })
    );
    const response = await fetch(`${api_endpoint}/api/client/files/upload/`, {
      method: "POST",
      body: formData,
    });
    const json = await response.json();
    console.log(json);
    setError(json.msg);
    setSuccess(json.success);
    handleClose();
  }

  const handleFilePath = (e) => {
    const files = e.target.files;
    const file = files[0];
    setFileName(file.name);
    setFilePath(file.path);
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Upload
      </Button>
      <Dialog open={open} onClose={handleClose}>
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
            value={fileName}
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
              "& .MuiInput-underline:before": {
                borderBottomColor: "white",
              },
              "&:hover .MuiInput-underline:hover:before": {
                borderBottomColor: "white",
              },
            }}
          />
          <input type="file" id="button-filePath" hidden onChange={handleFilePath} />
          <label htmlFor="button-filePath">
            <Button component="span">{filePath === "" ? "Choose file" : filePath}</Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            disabled={filePath === "" ? true : false}
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
