"use strict";
const electron = require("electron");
const path = require("node:path");
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
let win = null;
const createWindow = async () => {
  win = new electron.BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: "#0b0b0f",
    titleBarStyle: "hiddenInset",
    vibrancy: "under-window",
    trafficLightPosition: { x: 12, y: 12 },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: true
    }
  });
  if (!electron.app.isPackaged) {
    const url = process.env.VITE_DEV_SERVER_URL || "http://localhost:8000";
    win.loadURL(url);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "../index.html"));
  }
  win.webContents.setWindowOpenHandler(({ url }) => {
    electron.shell.openExternal(url);
    return { action: "deny" };
  });
};
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
electron.ipcMain.handle("ping", () => "pong");
