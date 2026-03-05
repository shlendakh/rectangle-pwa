import type { Metadata, Viewport } from "next"
import { PwaRegistration } from "@/pwa/pwa-registration"
import "./globals.css"

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
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <PwaRegistration />
      </body>
    </html>
  )
}
