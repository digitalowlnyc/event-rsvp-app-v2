"use server"

import { prisma } from "@/lib/prisma"
import { sendEmail, getVerificationEmailTemplate } from "@/lib/email"
import {
  createRsvpUserSession,
  generateVerificationToken,
} from "@/lib/session"
import { redirect } from "next/navigation"

export async function sendRsvpUserLoginLink(email: string) {
  // Find or create RsvpUser
  let rsvpUser = await prisma.rsvpUser.findUnique({
    where: { email },
  })

  if (!rsvpUser) {
    rsvpUser = await prisma.rsvpUser.create({
      data: { email },
    })
  }

  // Generate verification token
  const token = await generateVerificationToken()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Delete any existing tokens for this user
  await prisma.rsvpUserVerificationToken.deleteMany({
    where: { rsvpUserId: rsvpUser.id },
  })

  // Create new token
  await prisma.rsvpUserVerificationToken.create({
    data: {
      token,
      expires,
      rsvpUserId: rsvpUser.id,
    },
  })

  // Send email
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/rsvp/verify?token=${token}`

  await sendEmail({
    to: email,
    subject: "Sign in to manage your RSVPs",
    html: getVerificationEmailTemplate("", verifyUrl),
  })

  return { success: true }
}

export async function verifyRsvpUserToken(token: string) {
  const verificationToken = await prisma.rsvpUserVerificationToken.findUnique({
    where: { token },
    include: { rsvpUser: true },
  })

  if (!verificationToken) {
    return { success: false, error: "Invalid token" }
  }

  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.rsvpUserVerificationToken.delete({
      where: { id: verificationToken.id },
    })
    return { success: false, error: "Token has expired" }
  }

  // Mark email as verified
  await prisma.rsvpUser.update({
    where: { id: verificationToken.rsvpUserId },
    data: { emailVerified: new Date() },
  })

  // Link any existing RSVPs with this email
  await prisma.rsvp.updateMany({
    where: {
      email: verificationToken.rsvpUser.email,
      rsvpUserId: null,
    },
    data: {
      rsvpUserId: verificationToken.rsvpUserId,
    },
  })

  // Delete the used token
  await prisma.rsvpUserVerificationToken.delete({
    where: { id: verificationToken.id },
  })

  // Create session
  await createRsvpUserSession(verificationToken.rsvpUserId)

  redirect("/rsvp/manage")
}

export async function getRsvpUserRsvps(userId: string) {
  return prisma.rsvp.findMany({
    where: { rsvpUserId: userId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          dateTime: true,
          location: true,
        },
      },
    },
    orderBy: {
      event: {
        dateTime: "asc",
      },
    },
  })
}
