"use client"

import { useEffect } from "react"

export function PwaRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return
    }

    if (!("serviceWorker" in navigator)) {
      return
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" })
      } catch {
        // Ignore registration errors to keep app runtime stable.
      }
    }

    void registerServiceWorker()
  }, [])

  return null
}
