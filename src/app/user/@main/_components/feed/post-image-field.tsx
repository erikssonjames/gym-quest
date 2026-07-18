"use client"

import { ImagePlus, Trash2 } from "lucide-react"
import { useRef } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { RouterInputs } from "@/trpc/react"

export type FeedImageInput = NonNullable<RouterInputs["feed"]["createPost"]["image"]>

export function PostImageField({
  image,
  onChange,
  disabled,
}: {
  image: FeedImageInput | null
  onChange: (image: FeedImageInput | null) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const selectFile = async (file: File | undefined) => {
    if (!file) return
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast.error("Choose a JPEG, PNG, or WebP picture.")
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Post pictures must be smaller than 8 MB.")
      return
    }

    try {
      const base64 = await readFile(file)
      onChange({ name: file.name, type: file.type, base64 })
    } catch {
      toast.error("Could not read that picture. Please choose another file.")
    }
  }

  return (
    <Field>
      <FieldLabel>Picture</FieldLabel>
      {image ? (
        <div className="flex flex-col gap-3">
          <img
            alt="Selected post preview"
            className="max-h-72 w-full rounded-lg border object-contain"
            src={image.base64}
          />
          <Button
            className="self-start"
            disabled={disabled}
            onClick={() => onChange(null)}
            type="button"
            variant="outline"
          >
            <Trash2 data-icon="inline-start" />
            Remove picture
          </Button>
        </div>
      ) : (
        <Button
          className="self-start"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          type="button"
          variant="outline"
        >
          <ImagePlus data-icon="inline-start" />
          Add picture
        </Button>
      )}
      <FieldDescription>JPEG, PNG, or WebP up to 8 MB.</FieldDescription>
      <Input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          void selectFile(event.target.files?.[0])
          event.target.value = ""
        }}
        ref={inputRef}
        type="file"
      />
    </Field>
  )
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
