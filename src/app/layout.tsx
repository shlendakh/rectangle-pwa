import type { Metadata, Viewport } from "next"
import { ThemeCycleButton } from "@/components/theme/ThemeCycleButton"
import { PwaRegistration } from "@/pwa/PwaRegistration"
import "./globals.css"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Rectangle Cut",
  description: "Optimize rectangular cuts for woodworking sheets.",
  manifest: "/manifest.webmanifest",
  applicationName: "Rectangle Cut",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rectangle Cut",
  },
  icons: {
    icon: "/favicon/favicon.ico",
    apple: "/favicon/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // This script runs before React hydration and sets the initial theme based on session storage
  const themeBootstrapScript = `
    try {
      const key = "rectangle.theme.preference";
      const preference = window.sessionStorage.getItem(key);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolvedTheme = preference === "light" || preference === "dark"
        ? preference
        : (prefersDark ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", resolvedTheme);
    } catch {
      document.documentElement.setAttribute("data-theme", "light");
    }
  `

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <ThemeCycleButton />
        {children}
        <footer className="p-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Paweł Szlendak | {""}
          <Link href="http://github.com/shlendakh">@shlendakh</Link> | Rectangle Cut License v1.0
        </footer>
        <PwaRegistration />
      </body>
    </html>
  )
}
