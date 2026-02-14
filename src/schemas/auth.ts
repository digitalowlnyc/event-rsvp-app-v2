import { z } from "zod"
import { rsvpStatusSchema } from "./rsvp"

export const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const notificationSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be 200 characters or less"),
  body: z
    .string()
    .min(1, "Message is required")
    .max(5000, "Message must be 5000 characters or less"),
  statuses: z.array(rsvpStatusSchema).min(1, "Select at least one status"),
})

export type EmailInput = z.infer<typeof emailSchema>
export type NotificationInput = z.infer<typeof notificationSchema>
