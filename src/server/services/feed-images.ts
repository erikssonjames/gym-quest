import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary"
import sharp from "sharp"
import { TRPCError } from "@trpc/server"

import type { z } from "zod"
import type { FeedImageInputZod } from "@/server/db/schema/feed"

type FeedImageInput = z.infer<typeof FeedImageInputZod>

function uploadBuffer(buffer: Buffer, options: UploadApiOptions) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error)
      if (!result) return reject(new Error("Cloudinary did not return an upload result."))
      resolve(result)
    }).end(buffer)
  })
}

export async function uploadFeedImage(input: FeedImageInput, userId: string, postId: string) {
  const rawBase64 = input.base64.replace(/^data:image\/(jpeg|png|webp);base64,/, "")
  const fileBuffer = Buffer.from(rawBase64, "base64")

  if (fileBuffer.byteLength > 8 * 1024 * 1024) {
    throw new TRPCError({
      code: "PAYLOAD_TOO_LARGE",
      message: "Post pictures must be smaller than 8 MB.",
    })
  }

  let normalizedImage: Buffer
  try {
    normalizedImage = await sharp(fileBuffer)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()
  } catch {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "The uploaded file is not a valid image.",
    })
  }

  const result = await uploadBuffer(normalizedImage, {
    resource_type: "image",
    folder: `${userId}/feed`,
    public_id: postId,
    format: "webp",
    overwrite: true,
  })

  if (!result.secure_url || !result.public_id || !result.width || !result.height) {
    await destroyFeedImage(result.public_id ?? null)
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Picture upload failed." })
  }

  return {
    imageUrl: result.secure_url,
    imagePublicId: result.public_id,
    imageWidth: result.width,
    imageHeight: result.height,
  }
}

export async function destroyFeedImage(publicId: string | null) {
  if (!publicId) return

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
  } catch (error) {
    console.error("Could not remove a feed image from Cloudinary", error)
  }
}
