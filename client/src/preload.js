// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// In the preload script.

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // used to send a request to capture the image
  startCamera: (arg) => ipcRenderer.send("startCamera", arg),
  // get video feed from camera
  getVideoFeed: (callback) => ipcRenderer.on("getVideoFeed", callback),
  getAPIEndpoint: (callback) =>
    ipcRenderer.on("API_ENDPOINT", (event, arg) => callback(arg)),
});
