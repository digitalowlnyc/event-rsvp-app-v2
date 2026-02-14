import { z } from "zod"

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional()
    .nullable(),
  dateTime: z.string().datetime({ message: "Invalid date/time format" }),
  location: z
    .string()
    .min(1, "Location is required")
    .max(200, "Location must be 200 characters or less"),
  capacity: z
    .number()
    .int()
    .positive("Capacity must be a positive number")
    .optional()
    .nullable(),
})

export const updateEventSchema = createEventSchema.partial()

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
