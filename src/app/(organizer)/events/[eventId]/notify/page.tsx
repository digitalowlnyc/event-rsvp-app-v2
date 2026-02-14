"use client"

import { useActionState, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react"
import { sendEventNotification } from "@/actions/notification-actions"
import { useToast } from "@/hooks/use-toast"

const statusOptions = [
  { value: "GOING", label: "Going", color: "bg-green-100" },
  { value: "MAYBE", label: "Maybe", color: "bg-yellow-100" },
  { value: "INTERESTED_IN_FUTURE", label: "Interested in Future", color: "bg-gray-100" },
  { value: "NOT_GOING", label: "Not Going", color: "bg-red-100" },
]

export default function NotifyPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const { toast } = useToast()
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["GOING"])
  const [sent, setSent] = useState(false)
  const [sentCount, setSentCount] = useState(0)

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      // Add selected statuses to form data
      selectedStatuses.forEach((status) => {
        formData.append("statuses", status)
      })

      const result = await sendEventNotification(formData)

      if (result.success) {
        setSent(true)
        setSentCount(result.sentCount || 0)
        toast({
          title: "Notifications Sent",
          description: `Successfully sent to ${result.sentCount} recipients`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send notifications",
          variant: "destructive",
        })
      }

      return result
    },
    null
  )

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
  }

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Notifications Sent!</CardTitle>
            <CardDescription>
              Successfully sent to {sentCount} recipient
              {sentCount !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href={`/events/${eventId}`}>
              <Button variant="outline">Back to Event</Button>
            </Link>
            <div>
              <Button variant="ghost" onClick={() => setSent(false)}>
                Send Another Notification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/events/${eventId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Send Notification</h1>
          <p className="text-muted-foreground">
            Email RSVPs who provided their email address
          </p>
        </div>
      </div>

      <Card>
        <form action={formAction}>
          <input type="hidden" name="eventId" value={eventId} />
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>
              Select which RSVPs should receive this notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Send to RSVPs with status:</Label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleStatus(option.value)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      selectedStatuses.includes(option.value)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${option.color}`}
                      />
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
              {selectedStatuses.length === 0 && (
                <p className="text-sm text-destructive">
                  Select at least one status
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Event Update"
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                name="body"
                placeholder="Write your message here..."
                rows={6}
                required
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground">
                This message will be sent to all selected RSVPs who provided
                their email
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || selectedStatuses.length === 0}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
