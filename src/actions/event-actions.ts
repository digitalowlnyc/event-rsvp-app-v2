"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createEventSchema, updateEventSchema } from "@/schemas/event"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { nanoid } from "nanoid"

export async function createEvent(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string | null,
    dateTime: formData.get("dateTime") as string,
    location: formData.get("location") as string,
    capacity: formData.get("capacity")
      ? parseInt(formData.get("capacity") as string)
      : null,
  }

  const validated = createEventSchema.parse(rawData)

  const slug = nanoid(10)

  const event = await prisma.event.create({
    data: {
      ...validated,
      slug,
      organizerId: session.user.id,
    },
  })

  revalidatePath("/dashboard")
  redirect(`/events/${event.id}`)
}

export async function updateEvent(eventId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  })

  if (!event || event.organizerId !== session.user.id) {
    throw new Error("Event not found or unauthorized")
  }

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string | null,
    dateTime: formData.get("dateTime") as string,
    location: formData.get("location") as string,
    capacity: formData.get("capacity")
      ? parseInt(formData.get("capacity") as string)
      : null,
  }

  const validated = updateEventSchema.parse(rawData)

  await prisma.event.update({
    where: { id: eventId },
    data: validated,
  })

  revalidatePath("/dashboard")
  revalidatePath(`/events/${eventId}`)
}

export async function deleteEvent(eventId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  })

  if (!event || event.organizerId !== session.user.id) {
    throw new Error("Event not found or unauthorized")
  }

  await prisma.event.delete({
    where: { id: eventId },
  })

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

export async function updateEventImage(eventId: string, imagePath: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  })

  if (!event || event.organizerId !== session.user.id) {
    throw new Error("Event not found or unauthorized")
  }

  await prisma.event.update({
    where: { id: eventId },
    data: { imagePath },
  })

  revalidatePath(`/events/${eventId}`)
  revalidatePath(`/e/${event.slug}`)
}
