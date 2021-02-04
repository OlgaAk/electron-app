//require("electron-reload")(__dirname);
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { componentsToColor } = require("pdf-lib");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.loadFile("src/index.html");
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

ipcMain.on("openAlert", function (e, alertMessage) {
  console.log("main.js open Alert " + alertMessage);
  const alertWin = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  alertWin.on("close", function () {
    win = null;
  });
  alertWin.loadFile("src/alert.html");

  alertWin.webContents.openDevTools();
  alertWin.webContents.on("did-finish-load", () => {
    console.log("websontents sending " + alertMessage);
    alertWin.webContents.send("messsage", alertMessage);
  });

  //win.show();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
