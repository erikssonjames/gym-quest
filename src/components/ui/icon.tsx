'use client'

import Image from "next/image";
import { hammersmith } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface IconProps {
  displayText: boolean;
}

export default function Icon ({ displayText }: IconProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex py-3 ps-3 pe-3 md:ps-6 md:pe-9 rounded-md bg-primary/10 items-center gap-1">
      <Image
        alt="Logo"
        src="/icon/android-chrome-192x192.png"
        width={scrolled ? 30 : 60}
        height={scrolled ? 30 : 60}
        fill={false}
        className="object-contain transition-all duration-200"
      />
      {displayText && (
        <div className={cn(
          "uppercase hidden md:flex flex-col w-full justify-center items-center",
          hammersmith.className
        )}>
          <p 
            className={
              `leading-none transition-all duration-500 ${scrolled ? 'text-sm' : 'text-2xl'} 
              text-foreground/90 tracking-wide`
            }
            style={{ height: scrolled ? 14 : 24 }}
          >gym</p>
          <p
            className={
              `leading-none transition-all duration-500 ${scrolled ? 'text-xs' : 'text-lg'} 
              text-violet-500 tracking-tighter`
            }
          >quest</p>
        </div>
      )}
    </div>
  )
}