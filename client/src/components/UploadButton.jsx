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

export function UploadButton({ auth, setError }) {
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
  };

  async function handleUpload() {
    // fileName is required
    const file = window.internal.getFileData(filePath);

    // TODO fix admin
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
    console.log(json);
    setError(json.msg); // success :D
    handleClose();
  }

  const handleFilePath = (e) => {
    // const filePath = await window.internal.openFile();
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
