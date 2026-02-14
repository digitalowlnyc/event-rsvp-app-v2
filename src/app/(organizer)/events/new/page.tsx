import { EventForm } from "@/components/forms/event-form"
import { createEvent } from "@/actions/event-actions"

export default function NewEventPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <EventForm action={createEvent} submitLabel="Create Event" />
    </div>
  )
}
