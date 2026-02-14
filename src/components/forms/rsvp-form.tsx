"use client"

import { useActionState, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CheckCircle2 } from "lucide-react"
import { submitRsvp } from "@/actions/rsvp-actions"
import { useToast } from "@/hooks/use-toast"

interface Rsvp {
  id: string
  firstName: string
  lastInitial: string
  email: string | null
  status: string
}

interface RsvpFormProps {
  eventId: string
  eventTitle: string
  existingRsvp: Rsvp | null
  isAtCapacity: boolean
}

const statusOptions = [
  { value: "GOING", label: "Going", description: "I'll be there!" },
  { value: "MAYBE", label: "Maybe", description: "I might be able to make it" },
  {
    value: "INTERESTED_IN_FUTURE",
    label: "Interested in Future",
    description: "Can't make this one, but keep me posted",
  },
  {
    value: "NOT_GOING",
    label: "Not Going",
    description: "Sorry, I can't make it",
  },
]

export function RsvpForm({
  eventId,
  eventTitle,
  existingRsvp,
  isAtCapacity,
}: RsvpFormProps) {
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(
    existingRsvp?.status || "GOING"
  )

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await submitRsvp(formData)

      if (result.success) {
        setSubmitted(true)
        toast({
          title: result.isUpdate ? "RSVP Updated" : "RSVP Submitted",
          description: result.isUpdate
            ? "Your response has been updated"
            : "Thanks for your response!",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong",
          variant: "destructive",
        })
      }

      return result
    },
    null
  )

  // Reset submitted state if user wants to update
  useEffect(() => {
    if (existingRsvp) {
      setSubmitted(true)
    }
  }, [existingRsvp])

  if (submitted && !isPending) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>You&apos;re on the list!</CardTitle>
          <CardDescription>
            Your RSVP for {eventTitle} has been recorded.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Status:{" "}
            <strong>
              {
                statusOptions.find((s) => s.value === currentStatus)?.label
              }
            </strong>
          </p>
          <Button variant="outline" onClick={() => setSubmitted(false)}>
            Update my RSVP
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingRsvp ? "Update Your RSVP" : "RSVP to this Event"}
        </CardTitle>
        <CardDescription>
          {isAtCapacity && currentStatus === "GOING"
            ? "This event is at capacity. You can still RSVP as Maybe or Interested."
            : "Let the organizer know if you can make it"}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="eventId" value={eventId} />
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                defaultValue={existingRsvp?.firstName}
                required
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastInitial">Last Initial *</Label>
              <Input
                id="lastInitial"
                name="lastInitial"
                placeholder="D"
                defaultValue={existingRsvp?.lastInitial}
                required
                maxLength={1}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              defaultValue={existingRsvp?.email || ""}
            />
            <p className="text-xs text-muted-foreground">
              Provide your email to receive updates about this event
            </p>
          </div>

          <div className="space-y-3">
            <Label>Your Response *</Label>
            <RadioGroup
              name="status"
              defaultValue={existingRsvp?.status || "GOING"}
              onValueChange={setCurrentStatus}
              className="grid gap-3"
            >
              {statusOptions.map((option) => {
                const isDisabled =
                  isAtCapacity &&
                  option.value === "GOING" &&
                  existingRsvp?.status !== "GOING"

                return (
                  <label
                    key={option.value}
                    className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      isDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      disabled={isDisabled}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                        {isDisabled && " (Event at capacity)"}
                      </div>
                    </div>
                  </label>
                )
              })}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : existingRsvp ? (
              "Update RSVP"
            ) : (
              "Submit RSVP"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
