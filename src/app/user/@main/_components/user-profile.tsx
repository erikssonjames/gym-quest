"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/trpc/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { ImagePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { memo, useCallback, useMemo, useRef, useState } from "react"
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { Slider } from "@/components/ui/slider"
import SelectBadge from "@/components/ui/badge/select-badge"

export default function UserProfile () {
  const { data: user } = api.user.getMe.useQuery()
  
  return (
    <div className="w-full rounded-3xl overflow-hidden shadow-sm border">
      <div className="h-28 bg-gradient-to-bl from-primary via-violet-400 to-violet-600 w-full" />

      <div className="flex flex-col bg-card p-4">
        <div className="ml-2 w-fit relative">
          <div className="absolute -top-14 p-0 m-0 left-0 border-card border-4 rounded-full size-20">
            <UserProfilePicture />
          </div>
          <div className="h-7" />
        </div>
        <div className="ml-2 mt-2 flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <p className="text-lg font-bold">{user?.username}</p>
            <SelectBadge />
          </div>
        </div>
      </div>
    </div>
  )
}

function UserProfilePicture () {
  const { data: user } = api.user.getMe.useQuery()

  const [open, setOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const onClose = useCallback(() => {
    setOpen(false)
  }, [])
  
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedFile(null)
        }
        setOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <button className="cursor-pointer h-full w-full">
          <Avatar className="h-full w-full">
            <AvatarImage src={user?.uploadedImage ?? user?.image ?? ''} />
            <AvatarFallback className="h-full w-full">
              <ImagePlus size={20} className="text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile Picture</DialogTitle>
          <DialogDescription>Upload a new profile picture.</DialogDescription>
        </DialogHeader>
        <div className="w-full h-96 flex items-center justify-center">
          {!selectedFile ? (
            <button onClick={() => openFilePicker()}>
              <ImagePlus size={40} className="text-muted-foreground" />
            </button>
          ) : (
            <CropImage file={selectedFile} close={onClose} />
          )}
          
          <Input 
            type="file" 
            ref={fileInputRef} 
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

const CropImage = memo(({ file, close }: { file: File, close: () => void }) => {
  const utils = api.useUtils()
  const { mutate, isPending } = api.user.uploadProfilePicture.useMutation({
    onSuccess: () => {
      close()
      void utils.user.getMe.invalidate()
    }
  })

  const croppedAreaRef = useRef<Area>()

  const onCropComplete = async (croppedArea: Area, croppedAreaPixels: Area) => {
    croppedAreaRef.current = croppedAreaPixels
  }

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const onCropChange = (crop: Point) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const image = useMemo(() => URL.createObjectURL(file), [file])

  const onConfirm = async () => {
    if (!croppedAreaRef.current) return

    const croppedImage = await getCroppedImg(
      URL.createObjectURL(file),
      croppedAreaRef.current
    )

    const croppedFile: File = dataURLtoFile(croppedImage, file.name)
    const base64 = await fileToBase64(croppedFile)

    mutate({
      image: {
        base64,
        name: croppedFile.name,
        type: croppedFile.type
      }
    })
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow overflow-hidden relative">
        <Cropper
          image={image}
          crop={crop}
          onCropChange={onCropChange}
          zoom={zoom}
          onZoomChange={onZoomChange}
          aspect={1}
          showGrid={false}
          onCropComplete={onCropComplete}
          cropShape="round"
          objectFit="contain"
        />
      </div>

      <div className="pt-4 flex flex-col gap-4">
        <Slider step={0.01} min={1} max={5} value={[zoom]} onValueChange={(value) => setZoom(value[0] ?? 0)} />
        <div className="flex gap-2 w-full items-end justify-end">
          <Button variant="secondary">Cancel</Button>
          <Button onClick={onConfirm} disabled={isPending}>
            Confirm
            {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </div>
      </div>
    </div>
  )
})
CropImage.displayName = "crop-profile-image"

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Cant crop image, ctx is undefined")

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // set each dimensions to double largest dimension to allow for a safe area for the
  // image to rotate in without being clipped by canvas context
  canvas.width = safeArea;
  canvas.height = safeArea;

  // translate canvas context to a central location on image to allow rotating around the center.
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // draw rotated image and store data.
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image with correct offsets for x,y crop values.
  ctx.putImageData(
    data,
    0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
    0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
  );

  return canvas.toDataURL();
}

export const dataURLtoFile = (dataurl: string, filename: string): File => {
  // Split into [ header, base64String ]
  const arr = dataurl.split(",");
  if (arr.length < 2) {
    throw new Error("Invalid data URL (missing comma)");
  }
  
  // Extract the mime part from the header, e.g. "data:image/png;base64"
  const match = arr[0]!.match(/:(.*?);/);
  if (!match) {
    throw new Error("Invalid data URL (mime type not found)");
  }
  
  const mime = match[1]; // safe because we checked `match`
  const bstr = atob(arr[1]!); // safe because we checked `arr.length`
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  // Fill the typed array with char codes
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
