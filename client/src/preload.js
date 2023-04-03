// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// In the preload script.

const { contextBridge, ipcRenderer, app } = require("electron");

// 'internal' channel is used for internal stuff
contextBridge.exposeInMainWorld("internal", {
  // get video feed from camera
  getVideoFeed: (callback) => ipcRenderer.on("camera:live-feed", callback),
  // exposes the getAPIEndpoint function to get the API endpoint from env
  getAPIEndpoint: process.env.API_ENDPOINT,
  // prompts the user to select a directory to place the download in
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  getFileData: (filePath) => ipcRenderer.invoke("fs:readFile", filePath),
  getPicoEndpoint: process.env.PICO_API_ENDPOINT,
  // saves the file to file/path with fileName
  saveFile: (file, path, fileName) => ipcRenderer.send("save-file", file, path, fileName),
});
