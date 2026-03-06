"use client"

import { Button } from "@heroui/react"
import { useEffect, useState } from "react"
import {
  applyThemePreference,
  loadThemePreference,
  saveThemePreference,
  type ThemePreference,
} from "@/services/theme/session-theme"

function getNextPreference(currentPreference: ThemePreference): ThemePreference {
  if (currentPreference === "auto") {
    return "light"
  }

  if (currentPreference === "light") {
    return "dark"
  }

  return "auto"
}

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === "light") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (preference === "dark") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 14.1A8 8 0 1 1 9.9 4a6.5 6.5 0 1 0 10.1 10.1Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="4.5" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9 19.5h6M12 16.8v2.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ThemeCycleButton() {
  const [preference, setPreference] = useState<ThemePreference>(() => loadThemePreference())

  useEffect(() => {
    applyThemePreference(preference)

    if (preference !== "auto") {
      return
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const onSystemThemeChange = () => {
      applyThemePreference("auto")
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", onSystemThemeChange)
    } else {
      mediaQuery.addListener(onSystemThemeChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", onSystemThemeChange)
      } else {
        mediaQuery.removeListener(onSystemThemeChange)
      }
    }
  }, [preference])

  const nextPreference = getNextPreference(preference)

  return (
    <div className="z-50 flex w-full justify-end p-4 pb-0 md:fixed md:top-4 md:right-4 md:w-auto md:p-0">
      <Button
        aria-label={`Theme: ${preference}. Click to switch to ${nextPreference}.`}
        className="border-border bg-surface min-w-0 border text-(--foreground) shadow-sm"
        isIconOnly
        onPress={() => {
          setPreference(nextPreference)
          saveThemePreference(nextPreference)
        }}
        size="sm"
        variant="outline"
      >
        <ThemeIcon preference={preference} />
      </Button>
    </div>
  )
}
