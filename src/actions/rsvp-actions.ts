"use server"

import { prisma } from "@/lib/prisma"
import { createRsvpSchema } from "@/schemas/rsvp"
import {
  getOrCreateAnonymousSession,
  setAnonymousSessionCookie,
} from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function submitRsvp(formData: FormData) {
  const sessionToken = await getOrCreateAnonymousSession()

  const rawData = {
    eventId: formData.get("eventId") as string,
    firstName: formData.get("firstName") as string,
    lastInitial: formData.get("lastInitial") as string,
    email: formData.get("email") as string,
    status: formData.get("status") as string,
  }

  const validated = createRsvpSchema.parse(rawData)

  // Get the event to check capacity and get slug for revalidation
  const event = await prisma.event.findUnique({
    where: { id: validated.eventId },
    include: {
      _count: {
        select: {
          rsvps: {
            where: { status: "GOING" },
          },
        },
      },
    },
  })

  if (!event) {
    return { success: false, error: "Event not found" }
  }

  // Check for existing RSVP by session OR email
  const existingRsvp = await prisma.rsvp.findFirst({
    where: {
      eventId: validated.eventId,
      OR: [
        { sessionToken },
        validated.email ? { email: validated.email } : { id: "never-match" },
      ],
    },
  })

  if (existingRsvp) {
    // Update existing RSVP
    await prisma.rsvp.update({
      where: { id: existingRsvp.id },
      data: {
        firstName: validated.firstName,
        lastInitial: validated.lastInitial,
        email: validated.email,
        status: validated.status,
        sessionToken, // Update session token if they're on new browser
      },
    })

    await setAnonymousSessionCookie(sessionToken)
    revalidatePath(`/e/${event.slug}`)

    return { success: true, isUpdate: true }
  }

  // Check capacity for new "GOING" RSVPs
  if (validated.status === "GOING" && event.capacity) {
    if (event._count.rsvps >= event.capacity) {
      return { success: false, error: "Event is at capacity" }
    }
  }

  // Create new RSVP
  await prisma.rsvp.create({
    data: {
      eventId: validated.eventId,
      firstName: validated.firstName,
      lastInitial: validated.lastInitial,
      email: validated.email,
      status: validated.status,
      sessionToken,
    },
  })

  await setAnonymousSessionCookie(sessionToken)
  revalidatePath(`/e/${event.slug}`)

  return { success: true, isUpdate: false }
}

export async function getRsvpForSession(eventId: string) {
  const sessionToken = await getOrCreateAnonymousSession()

  if (!sessionToken) {
    return null
  }

  const rsvp = await prisma.rsvp.findFirst({
    where: {
      eventId,
      sessionToken,
    },
  })

  return rsvp
}
