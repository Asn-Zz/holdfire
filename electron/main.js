const { app, BrowserWindow, ipcMain, nativeTheme } = require("electron")
const path = require("path")
const isDev = process.env.NODE_ENV === "development"

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: "hiddenInset",
    backgroundColor: "#0a0a0a",
  })

  // Load the app
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000")
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"))
  }

  // Send initial theme
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("theme-changed", nativeTheme.shouldUseDarkColors ? "dark" : "light")
  })

  // Listen for theme changes from system
  nativeTheme.on("updated", () => {
    mainWindow.webContents.send("theme-changed", nativeTheme.shouldUseDarkColors ? "dark" : "light")
  })
}

// IPC handlers
ipcMain.handle("get-system-theme", () => {
  return nativeTheme.shouldUseDarkColors ? "dark" : "light"
})

ipcMain.handle("set-theme", (event, theme) => {
  if (theme === "system") {
    nativeTheme.themeSource = "system"
  } else {
    nativeTheme.themeSource = theme
  }
  return nativeTheme.shouldUseDarkColors ? "dark" : "light"
})

app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})
