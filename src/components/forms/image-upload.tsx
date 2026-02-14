"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, X } from "lucide-react"
import { updateEventImage } from "@/actions/event-actions"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  eventId: string
  currentImage: string | null
}

export function ImageUpload({ eventId, currentImage }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage)
  const { toast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("eventId", eventId)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const { path } = await response.json()
      setPreview(path)
      await updateEventImage(eventId, path)

      toast({
        title: "Image uploaded",
        description: "Your event image has been updated",
      })
    } catch {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    setIsUploading(true)
    try {
      await updateEventImage(eventId, "")
      setPreview(null)
      toast({
        title: "Image removed",
        description: "Your event image has been removed",
      })
    } catch {
      toast({
        title: "Failed to remove image",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <Image
            src={preview}
            alt="Event image"
            fill
            className="object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed hover:bg-muted/50">
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Click to upload an image
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Max 5MB, JPG, PNG, or WebP
              </span>
            </>
          )}
        </label>
      )}
    </div>
  )
}
