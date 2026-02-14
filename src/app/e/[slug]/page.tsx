import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { RsvpForm } from "@/components/forms/rsvp-form"
import { getRsvpForSession } from "@/actions/rsvp-actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { format } from "date-fns"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const event = await prisma.event.findUnique({
    where: { slug },
  })

  if (!event) {
    return { title: "Event Not Found" }
  }

  return {
    title: `${event.title} | Event RSVP`,
    description:
      event.description || `RSVP to ${event.title} on ${format(new Date(event.dateTime), "PPP")}`,
  }
}

export default async function PublicEventPage({ params }: Props) {
  const { slug } = await params

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      organizer: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          rsvps: true,
        },
      },
      rsvps: {
        where: { status: "GOING" },
        select: { id: true },
      },
    },
  })

  if (!event || !event.isPublished) {
    notFound()
  }

  const existingRsvp = await getRsvpForSession(event.id)
  const goingCount = event.rsvps.length
  const isAtCapacity = event.capacity ? goingCount >= event.capacity : false
  const isPast = new Date(event.dateTime) < new Date()

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {event.imagePath && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-8">
              <Image
                src={event.imagePath}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl">{event.title}</CardTitle>
                      <CardDescription className="mt-2">
                        Hosted by {event.organizer.name || event.organizer.email}
                      </CardDescription>
                    </div>
                    {isPast && <Badge variant="secondary">Past Event</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">
                          {format(new Date(event.dateTime), "EEEE, MMMM d, yyyy")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(event.dateTime), "h:mm a")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-sm text-muted-foreground">
                          {event.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  {event.description && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-medium mb-2">About this event</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {event.description}
                        </p>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span>
                        <strong>{event._count.rsvps}</strong> RSVP
                        {event._count.rsvps !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {event.capacity && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span>
                          <strong>{goingCount}</strong> / {event.capacity} going
                          {isAtCapacity && (
                            <Badge variant="destructive" className="ml-2">
                              At Capacity
                            </Badge>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {isPast ? (
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle>This event has passed</CardTitle>
                    <CardDescription>
                      Thanks for your interest! Check out other upcoming events.
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <RsvpForm
                  eventId={event.id}
                  eventTitle={event.title}
                  existingRsvp={existingRsvp}
                  isAtCapacity={isAtCapacity}
                />
              )}
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Powered by{" "}
              <Link href="/" className="text-primary hover:underline">
                Event RSVP
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
