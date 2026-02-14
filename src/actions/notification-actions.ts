"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail, getEventNotificationTemplate } from "@/lib/email"
import { notificationSchema } from "@/schemas/auth"
import { revalidatePath } from "next/cache"
import type { RsvpStatus } from "@prisma/client"

export async function sendEventNotification(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const rawData = {
    eventId: formData.get("eventId") as string,
    subject: formData.get("subject") as string,
    body: formData.get("body") as string,
    statuses: formData.getAll("statuses") as string[],
  }

  const validated = notificationSchema.parse(rawData)

  // Verify event ownership
  const event = await prisma.event.findUnique({
    where: { id: validated.eventId },
    include: {
      rsvps: {
        where: {
          email: { not: null },
          status: { in: validated.statuses as RsvpStatus[] },
        },
        select: {
          email: true,
          firstName: true,
        },
      },
    },
  })

  if (!event || event.organizerId !== session.user.id) {
    return { success: false, error: "Event not found or unauthorized" }
  }

  const recipients = event.rsvps.filter((rsvp) => rsvp.email)

  if (recipients.length === 0) {
    return { success: false, error: "No recipients with email addresses" }
  }

  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/e/${event.slug}`

  // Send emails
  const emailPromises = recipients.map((recipient) =>
    sendEmail({
      to: recipient.email!,
      subject: validated.subject,
      html: getEventNotificationTemplate(
        event.title,
        validated.subject,
        validated.body,
        eventUrl
      ),
    })
  )

  try {
    await Promise.all(emailPromises)

    // Log the notification
    await prisma.emailNotification.create({
      data: {
        eventId: validated.eventId,
        subject: validated.subject,
        body: validated.body,
        sentCount: recipients.length,
      },
    })

    revalidatePath(`/events/${validated.eventId}`)

    return { success: true, sentCount: recipients.length }
  } catch (error) {
    console.error("Failed to send notifications:", error)
    return { success: false, error: "Failed to send some emails" }
  }
}

export async function getNotificationHistory(eventId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  })

  if (!event || event.organizerId !== session.user.id) {
    return []
  }

  return prisma.emailNotification.findMany({
    where: { eventId },
    orderBy: { sentAt: "desc" },
    take: 10,
  })
}
