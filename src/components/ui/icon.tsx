import Image from "next/image";
import { hammersmith } from "@/styles/fonts";
import { cn } from "@/lib/utils";

interface IconProps {
  displayText: boolean;
}

export default function Icon ({ displayText }: IconProps) {
  return (
    <div className="flex py-3 ps-6 pe-9 rounded-md bg-primary/10 items-center gap-1">
      <Image
          alt="Logo"
          src="/icon/android-chrome-192x192.png"
          width={60}
          height={60}
          fill={false}
          className="object-contain"
      />
      {displayText && (
        <div className={cn(
          "uppercase flex flex-col w-full justify-center items-center",
          hammersmith.className
        )}>
          <p className="leading-none text-2xl text-foreground/90 tracking-wide" style={{ height: 24 }}>gym</p>
          <p className="leading-none text-lg text-violet-500 tracking-tighter">quest</p>
        </div>
      )}
    </div>
  )
}