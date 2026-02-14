"use client"

import { useActionState } from "react"
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
import { Loader2 } from "lucide-react"

interface Event {
  id: string
  title: string
  description: string | null
  dateTime: Date
  location: string
  capacity: number | null
}

interface EventFormProps {
  event?: Event
  action: (formData: FormData) => Promise<void>
  submitLabel?: string
}

export function EventForm({
  event,
  action,
  submitLabel = "Create Event",
}: EventFormProps) {
  const [, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      await action(formData)
    },
    null
  )

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{event ? "Edit Event" : "Create New Event"}</CardTitle>
        <CardDescription>
          {event
            ? "Update your event details below"
            : "Fill in the details for your new event"}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter event title"
              defaultValue={event?.title}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your event..."
              defaultValue={event?.description || ""}
              rows={4}
              maxLength={2000}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateTime">Date & Time *</Label>
              <Input
                id="dateTime"
                name="dateTime"
                type="datetime-local"
                defaultValue={
                  event ? formatDateTimeLocal(new Date(event.dateTime)) : ""
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (optional)</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                placeholder="Unlimited"
                defaultValue={event?.capacity || ""}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for unlimited capacity
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              name="location"
              placeholder="Enter event location"
              defaultValue={event?.location}
              required
              maxLength={200}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
