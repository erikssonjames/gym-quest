'use client'

import { SparklesCore } from "@/components/ui/sparkles"
import { useTheme } from "next-themes"
import Image from "next/image"

export default function GymQuester() {
  const { theme } = useTheme()

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="relative flex flex-col">
        <div style={{ width: 475, height: 400 }} className="relative block">
          <Image
            src="/gym-quester.png"
            alt="gym-quester"
            fill
            className="z-10 relative object-contain"
            />
        </div>
        <div className="absolute z-0 -top-10 h-full w-full bg-gradient-to-r from-violet-400 to-purple-600 blur-3xl opacity-10 rounded-full" />
        <div className="absolute -bottom-10 w-full h-40 dark:opacity-70 blur-3xl dark:bg-black z-20" />
        <div className="w-full block absolute z-0 -bottom-0 rounded-full overflow-hidden" style={{ height: 130 }}>
          <Image
              src="/grass-hill.png"
              alt="gym-quester"
              fill
              className="relative object-contain"
            />
        </div>

        <div className="absolute -bottom-20 w-full text-center z-30">
          <div className="font-semibold mb-4">
            <p className="inline-block text-sm">Turn your workout experience, into a</p>
            <span className="text-primary inline-block relative mx-6 text-2xl" id="GYMQUESTER-END">
              questing
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={400}
                particleColor={theme === 'light' ? '#a244ff' : "#64748b"}
                className="w-full h-12 absolute"
              />
            </span> 
            <p className="inline-block text-sm">journey</p>
          </div>
        </div>
      </div>
    </div>
  )
}