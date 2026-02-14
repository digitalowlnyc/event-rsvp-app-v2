import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Plus, ExternalLink } from "lucide-react"
import { format } from "date-fns"

export default async function DashboardPage() {
  const session = await auth()

  const events = await prisma.event.findMany({
    where: {
      organizerId: session!.user!.id,
    },
    include: {
      _count: {
        select: {
          rsvps: true,
        },
      },
      rsvps: {
        select: {
          status: true,
        },
      },
    },
    orderBy: {
      dateTime: "asc",
    },
  })

  const getRsvpCounts = (
    rsvps: { status: string }[]
  ): Record<string, number> => {
    return rsvps.reduce(
      (acc, rsvp) => {
        acc[rsvp.status] = (acc[rsvp.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your events and track RSVPs
          </p>
        </div>
        <Link href="/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first event to start collecting RSVPs
            </p>
            <Link href="/events/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const counts = getRsvpCounts(event.rsvps)
            const isPast = new Date(event.dateTime) < new Date()

            return (
              <Card key={event.id} className={isPast ? "opacity-75" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    {isPast && <Badge variant="secondary">Past</Badge>}
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(event.dateTime), "PPP 'at' p")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    <span>
                      {event._count.rsvps} RSVP{event._count.rsvps !== 1 ? "s" : ""}
                      {event.capacity && ` / ${event.capacity} capacity`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {counts.GOING && (
                      <Badge variant="success">
                        {counts.GOING} Going
                      </Badge>
                    )}
                    {counts.MAYBE && (
                      <Badge variant="warning">
                        {counts.MAYBE} Maybe
                      </Badge>
                    )}
                    {counts.INTERESTED_IN_FUTURE && (
                      <Badge variant="secondary">
                        {counts.INTERESTED_IN_FUTURE} Interested
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Link href={`/events/${event.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Manage
                    </Button>
                  </Link>
                  <Link
                    href={`/e/${event.slug}`}
                    target="_blank"
                    className="flex-1"
                  >
                    <Button variant="secondary" className="w-full" size="sm">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      View
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
