import { z } from "zod"

export const rsvpStatusSchema = z.enum([
  "GOING",
  "MAYBE",
  "INTERESTED_IN_FUTURE",
  "NOT_GOING",
])

export type RsvpStatus = z.infer<typeof rsvpStatusSchema>

export const createRsvpSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less")
    .transform((s) => s.trim()),
  lastInitial: z
    .string()
    .length(1, "Last initial must be one character")
    .regex(/[A-Za-z]/, "Must be a letter")
    .transform((s) => s.toUpperCase()),
  email: z
    .union([z.string().email("Invalid email address"), z.literal("")])
    .optional()
    .transform((e) => e || null),
  status: rsvpStatusSchema,
})

export const updateRsvpSchema = createRsvpSchema.omit({ eventId: true })

export type CreateRsvpInput = z.infer<typeof createRsvpSchema>
export type UpdateRsvpInput = z.infer<typeof updateRsvpSchema>
