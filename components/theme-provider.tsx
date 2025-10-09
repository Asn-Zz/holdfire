"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)

    // Check if running in Electron
    if (typeof window !== "undefined" && (window as any).electron?.isElectron) {
      const electron = (window as any).electron

      // Get initial system theme
      electron.getSystemTheme().then((theme: string) => {
        console.log("[v0] Initial Electron theme:", theme)
      })

      // Listen for system theme changes
      electron.onThemeChanged((theme: string) => {
        console.log("[v0] Electron theme changed:", theme)
        // The next-themes provider will handle the actual theme update
      })

      return () => {
        electron.removeThemeListener()
      }
    }
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
