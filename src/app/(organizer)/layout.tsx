import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, LayoutDashboard, LogOut, Plus } from "lucide-react"
import { signOut } from "@/lib/auth"

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                <span className="font-semibold text-lg">Event RSVP</span>
              </Link>
              <nav className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/events/new">
                  <Button variant="ghost" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Event
                  </Button>
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session.user?.email}
              </span>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
