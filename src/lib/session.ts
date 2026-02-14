import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { SignJWT, jwtVerify } from "jose"

const ANONYMOUS_SESSION_COOKIE = "rsvp-anon-session"
const RSVP_USER_SESSION_COOKIE = "rsvp-user-session"
const SESSION_DURATION = 60 * 60 * 24 * 365 // 1 year in seconds

const secret = new TextEncoder().encode(
  process.env.RSVP_SESSION_SECRET || "development-secret"
)

/**
 * Get the anonymous session token from cookies
 */
export async function getAnonymousSession(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ANONYMOUS_SESSION_COOKIE)?.value ?? null
}

/**
 * Get or create an anonymous session token
 */
export async function getOrCreateAnonymousSession(): Promise<string> {
  const existing = await getAnonymousSession()
  if (existing) return existing
  return uuidv4()
}

/**
 * Set the anonymous session cookie
 */
export async function setAnonymousSessionCookie(sessionToken: string) {
  const cookieStore = await cookies()
  cookieStore.set(ANONYMOUS_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  })
}

/**
 * Create a JWT session for RSVP users (who provided email)
 */
export async function createRsvpUserSession(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set(RSVP_USER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return token
}

/**
 * Get the RSVP user session from cookies
 */
export async function getRsvpUserSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(RSVP_USER_SESSION_COOKIE)?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}

/**
 * Clear the RSVP user session
 */
export async function clearRsvpUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete(RSVP_USER_SESSION_COOKIE)
}

/**
 * Generate a verification token for RSVP user login
 */
export async function generateVerificationToken(): Promise<string> {
  return uuidv4()
}
