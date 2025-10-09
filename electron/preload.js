const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electron", {
  getSystemTheme: () => ipcRenderer.invoke("get-system-theme"),
  setTheme: (theme) => ipcRenderer.invoke("set-theme", theme),
  onThemeChanged: (callback) => {
    ipcRenderer.on("theme-changed", (event, theme) => callback(theme))
  },
  removeThemeListener: () => {
    ipcRenderer.removeAllListeners("theme-changed")
  },
  isElectron: true,
})
