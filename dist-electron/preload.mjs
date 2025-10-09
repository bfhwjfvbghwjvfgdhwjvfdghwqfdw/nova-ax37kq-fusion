"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("xvser", {
  ping: async () => await electron.ipcRenderer.invoke("ping")
});
