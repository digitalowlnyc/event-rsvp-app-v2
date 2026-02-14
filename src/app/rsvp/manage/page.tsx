import { redirect } from "next/navigation"
import Link from "next/link"
import { getRsvpUserSession, clearRsvpUserSession } from "@/lib/session"
import { getRsvpUserRsvps } from "@/actions/rsvp-user-actions"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, ExternalLink, LogOut } from "lucide-react"
import { format } from "date-fns"

const statusLabels: Record<string, string> = {
  GOING: "Going",
  MAYBE: "Maybe",
  INTERESTED_IN_FUTURE: "Interested in Future",
  NOT_GOING: "Not Going",
}

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
> = {
  GOING: "success",
  MAYBE: "warning",
  INTERESTED_IN_FUTURE: "secondary",
  NOT_GOING: "outline",
}

export default async function ManageRsvpsPage() {
  const session = await getRsvpUserSession()

  if (!session) {
    redirect("/rsvp/login")
  }

  const rsvpUser = await prisma.rsvpUser.findUnique({
    where: { id: session.userId },
  })

  if (!rsvpUser) {
    redirect("/rsvp/login")
  }

  const rsvps = await getRsvpUserRsvps(session.userId)

  const upcomingRsvps = rsvps.filter(
    (rsvp) => new Date(rsvp.event.dateTime) >= new Date()
  )
  const pastRsvps = rsvps.filter(
    (rsvp) => new Date(rsvp.event.dateTime) < new Date()
  )

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span className="font-semibold text-lg">Event RSVP</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {rsvpUser.email}
              </span>
              <form
                action={async () => {
                  "use server"
                  await clearRsvpUserSession()
                  redirect("/")
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

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Your RSVPs</h1>
            <p className="text-muted-foreground">
              View and manage your event responses
            </p>
          </div>

          {rsvps.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No RSVPs yet</h3>
                <p className="text-muted-foreground">
                  When you RSVP to events with this email, they&apos;ll appear
                  here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {upcomingRsvps.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Upcoming Events</h2>
                  <div className="space-y-4">
                    {upcomingRsvps.map((rsvp) => (
                      <Card key={rsvp.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{rsvp.event.title}</CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {format(
                                  new Date(rsvp.event.dateTime),
                                  "PPP 'at' p"
                                )}
                              </CardDescription>
                            </div>
                            <Badge variant={statusVariants[rsvp.status]}>
                              {statusLabels[rsvp.status]}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="mr-1 h-4 w-4" />
                              {rsvp.event.location}
                            </div>
                            <Link href={`/e/${rsvp.event.slug}`}>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="mr-2 h-3 w-3" />
                                Update RSVP
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {pastRsvps.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-muted-foreground">
                    Past Events
                  </h2>
                  <div className="space-y-4">
                    {pastRsvps.map((rsvp) => (
                      <Card key={rsvp.id} className="opacity-75">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-muted-foreground">
                                {rsvp.event.title}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {format(
                                  new Date(rsvp.event.dateTime),
                                  "PPP 'at' p"
                                )}
                              </CardDescription>
                            </div>
                            <Badge variant="outline">
                              {statusLabels[rsvp.status]}
                            </Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
