'use client'

import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react"

interface NavbarMinimizerProps {
  children: ReactNode
}

export default function NavbarMinimizer ({ children }: NavbarMinimizerProps) {
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
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-4 transition-all duration-200",
        scrolled ? "py-3" : "py-5 lg:py-7",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/80 px-3 backdrop-blur-md",
          scrolled ? "py-2 shadow-sm" : "py-3",
        )}
      >
        {children}
      </div>
    </nav>
  )
}
