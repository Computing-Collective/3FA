// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// In the preload script.
const { ipcRenderer, contextBridge } = require("electron");

// 'internal' channel is used for internal stuff
contextBridge.exposeInMainWorld("internal", {
  // exposes the getAPIEndpoint function to get the API endpoint from env
  getAPIEndpoint: process.env.API_ENDPOINT,
});
