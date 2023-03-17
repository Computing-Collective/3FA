// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// In the preload script.
const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("internal", {
  getAPIEndpoint: (callback) =>
    ipcRenderer.on("API_ENDPOINT", (event, arg) => callback(arg)),
});
