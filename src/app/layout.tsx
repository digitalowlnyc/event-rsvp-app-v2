import type { Metadata } from "next"
import "./globals.css"
import { SessionProvider } from "@/components/providers/session-provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Event RSVP",
  description: "Create and manage event RSVPs easily",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
