import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const fromEmail = process.env.EMAIL_FROM || "Event RSVP <noreply@resend.dev>"

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    })

    if (error) {
      console.error("Failed to send email:", error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error("Email sending error:", error)
    throw error
  }
}

export function getVerificationEmailTemplate(
  name: string,
  verifyUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify your email</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">Verify your email</h1>
  <p>Hi ${name || "there"},</p>
  <p>Click the button below to sign in to your RSVP account:</p>
  <a href="${verifyUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Sign In</a>
  <p style="color: #666; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
  <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
</body>
</html>
  `.trim()
}

export function getEventNotificationTemplate(
  eventTitle: string,
  subject: string,
  body: string,
  eventUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">${eventTitle}</h1>
  <h2 style="color: #333;">${subject}</h2>
  <div style="white-space: pre-wrap; margin: 20px 0;">${body}</div>
  <a href="${eventUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Event</a>
  <p style="color: #666; font-size: 14px;">You received this email because you RSVP'd to this event.</p>
</body>
</html>
  `.trim()
}
