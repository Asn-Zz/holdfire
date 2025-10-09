export interface ElectronAPI {
  getSystemTheme: () => Promise<"light" | "dark">
  setTheme: (theme: "light" | "dark" | "system") => Promise<"light" | "dark">
  onThemeChanged: (callback: (theme: "light" | "dark") => void) => void
  removeThemeListener: () => void
  isElectron: boolean
}

declare global {
  interface Window {
    electron?: ElectronAPI
  }
}
