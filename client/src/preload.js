// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// In the preload script.

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("internal", {
  // get video feed from camera
  getVideoFeed: (callback) => ipcRenderer.on("camera:live-feed", callback),
  getAPIEndpoint: (callback) =>
    ipcRenderer.on("API_ENDPOINT", (event, arg) => callback(arg)),
});
