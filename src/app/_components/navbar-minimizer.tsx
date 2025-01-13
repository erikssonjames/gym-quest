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
    <nav className={cn(
      "fixed left-0 right-0 flex justify-between items-center z-50 transition-all duration-200",
      scrolled ? "p-4" : "p-10"
    )}>
      {children}
    </nav>
  )
}