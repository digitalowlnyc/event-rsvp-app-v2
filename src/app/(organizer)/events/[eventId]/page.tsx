import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { EventForm } from "@/components/forms/event-form"
import { updateEvent, deleteEvent } from "@/actions/event-actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ExternalLink,
  Users,
  Mail,
  Copy,
  Trash2,
  ImageIcon,
} from "lucide-react"
import { format } from "date-fns"
import { ImageUpload } from "@/components/forms/image-upload"

interface Props {
  params: Promise<{ eventId: string }>
}

export default async function EventDetailPage({ params }: Props) {
  const { eventId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
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
  })

  if (!event || event.organizerId !== session.user.id) {
    notFound()
  }

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

  const counts = getRsvpCounts(event.rsvps)
  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/e/${event.slug}`

  const updateEventWithId = updateEvent.bind(null, eventId)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground">
            {format(new Date(event.dateTime), "PPP 'at' p")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/events/${eventId}/rsvps`}>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              View RSVPs ({event._count.rsvps})
            </Button>
          </Link>
          <Link href={`/events/${eventId}/notify`}>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <EventForm
            event={event}
            action={updateEventWithId}
            submitLabel="Save Changes"
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Event Image
              </CardTitle>
              <CardDescription>
                Upload an image for your event (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload eventId={eventId} currentImage={event.imagePath} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Share Event</CardTitle>
              <CardDescription>
                Share this link with your guests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 text-sm truncate">
                  {eventUrl}
                </code>
                <Button variant="outline" size="icon" asChild>
                  <Link href={eventUrl} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {}}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>RSVP Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Going</span>
                <Badge variant="success">{counts.GOING || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Maybe</span>
                <Badge variant="warning">{counts.MAYBE || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Interested in Future</span>
                <Badge variant="secondary">
                  {counts.INTERESTED_IN_FUTURE || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Not Going</span>
                <Badge variant="outline">{counts.NOT_GOING || 0}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-medium">
                <span>Total RSVPs</span>
                <span>{event._count.rsvps}</span>
              </div>
              {event.capacity && (
                <div className="flex items-center justify-between text-muted-foreground text-sm">
                  <span>Capacity</span>
                  <span>{event.capacity}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={deleteEvent.bind(null, eventId)}>
                <Button variant="destructive" type="submit" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Event
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
