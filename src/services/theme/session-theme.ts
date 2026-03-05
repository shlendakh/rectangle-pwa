export type ThemePreference = "auto" | "light" | "dark"
export type ResolvedTheme = "light" | "dark"

const THEME_PREFERENCE_KEY = "rectangle.theme.preference"

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "auto" || value === "light" || value === "dark"
}

export function loadThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "auto"
  }

  const rawValue = window.sessionStorage.getItem(THEME_PREFERENCE_KEY)
  return isThemePreference(rawValue) ? rawValue : "auto"
}

export function saveThemePreference(value: ThemePreference): void {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(THEME_PREFERENCE_KEY, value)
}

export function applyThemePreference(value: ThemePreference): void {
  if (typeof document === "undefined") {
    return
  }

  const root = document.documentElement
  const resolvedTheme = value === "auto" ? resolveSystemTheme() : value
  root.setAttribute("data-theme", resolvedTheme)
}

export function resolveSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}
