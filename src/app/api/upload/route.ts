import { writeFile, mkdir } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { auth } from "@/lib/auth"

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/events")
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true })

    // Generate unique filename
    const ext = path.extname(file.name) || ".jpg"
    const filename = `${uuidv4()}${ext}`
    const filepath = path.join(UPLOAD_DIR, filename)

    // Write file
    const bytes = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(bytes))

    return NextResponse.json({
      path: `/uploads/events/${filename}`,
      filename,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
