const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { readFileSync } = require("node:fs");
const { desktopCapturer } = require("electron");
require("dotenv").config();

// TODO make elio pay microsoft
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
  });

  // send API_ENDPOINT to renderer on the "API_ENDPOINT" channel
  mainWindow.webContents.send("API_ENDPOINT", process.env.API_ENDPOINT);

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  ipcMain.handle("dialog:openFile", handleFileOpen);
  ipcMain.handle("fs:readFile", handleFileData);
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

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
  });
  if (canceled) {
    return;
  } else {
    return filePaths[0];
  }
}

function handleFileData(event, filePath) {
  console.log(filePath);
  return readFileSync(filePath, "utf-8");
}
