const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { readFileSync, writeFile } = require("node:fs");
const { desktopCapturer } = require("electron");
require("dotenv").config();

API_ENDPOINT = "https://3fa.bxian03.com/";

require("update-electron-app")({
  updateInterval: "1 hour",
});

app.commandLine.appendSwitch("ignore-certificate-errors");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    autoHideMenuBar: true, // hide menu bar
    icon: "./public/app/app_icon.png",
  });

  // send API_ENDPOINT to renderer on the "API_ENDPOINT" channel
  mainWindow.webContents.send("API_ENDPOINT", API_ENDPOINT);

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  ipcMain.handle("dialog:openFile", handleFileOpen);
  ipcMain.handle("fs:readFile", handleFileData);
  ipcMain.on("save-file", handleSaveFile);
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

/**
 * @brief prompts the user to choose a directory
 *
 * @returns the file path (directory) that the user chose
 */
async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (canceled) {
    return;
  } else {
    return filePaths[0];
  }
}

/**
 * @brief reads the file at filePath
 *
 * @param {*} event
 * @param {string} filePath the filepath to read the file from
 * @returns {Promise} the result of readFileSync on filePath
 */
function handleFileData(event, filePath) {
  return readFileSync(filePath);
}

/**
 * @brief downloads fileName to path/file
 *
 * @param {*} event
 * @param {ArrayBuffer} file the file to download
 * @param {string} path the path to download the file to
 * @param {string} fileName the file name
 *
 */
async function handleSaveFile(event, file, path, fileName) {
  console.log("writing");
  console.log(file, path, fileName);
  const buffer = Buffer.from(file);

  writeFile(`${path}/${fileName}`, buffer, (err) => {
    if (err) console.log(err); // TODO change to win alert or something
  });
}
