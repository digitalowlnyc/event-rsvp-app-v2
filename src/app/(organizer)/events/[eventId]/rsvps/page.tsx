import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Mail, Download } from "lucide-react"
import { format } from "date-fns"

interface Props {
  params: Promise<{ eventId: string }>
}

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

export default async function RSVPsPage({ params }: Props) {
  const { eventId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      rsvps: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!event || event.organizerId !== session.user.id) {
    notFound()
  }

  const rsvpsByStatus = event.rsvps.reduce(
    (acc, rsvp) => {
      acc[rsvp.status] = (acc[rsvp.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const emailCount = event.rsvps.filter((r) => r.email).length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/events/${eventId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">RSVPs</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/events/${eventId}/notify`}>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Send Notification ({emailCount} emails)
            </Button>
          </Link>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Going</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {rsvpsByStatus.GOING || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Maybe</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {rsvpsByStatus.MAYBE || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Interested</CardDescription>
            <CardTitle className="text-3xl text-gray-600">
              {rsvpsByStatus.INTERESTED_IN_FUTURE || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Not Going</CardDescription>
            <CardTitle className="text-3xl">
              {rsvpsByStatus.NOT_GOING || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All RSVPs ({event.rsvps.length})</CardTitle>
          <CardDescription>
            {emailCount} {emailCount === 1 ? "person has" : "people have"}{" "}
            provided their email
          </CardDescription>
        </CardHeader>
        <CardContent>
          {event.rsvps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No RSVPs yet. Share your event link to start collecting responses.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {event.rsvps.map((rsvp) => (
                  <TableRow key={rsvp.id}>
                    <TableCell className="font-medium">
                      {rsvp.firstName} {rsvp.lastInitial}.
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[rsvp.status]}>
                        {statusLabels[rsvp.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rsvp.email ? (
                        <a
                          href={`mailto:${rsvp.email}`}
                          className="text-primary hover:underline"
                        >
                          {rsvp.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(rsvp.createdAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
