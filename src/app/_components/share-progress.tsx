"use client"

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Send, SmilePlus, Trophy } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";


export default function ShareProgress() {
  return (
    <div className="max-h-[1500px] relative">

      <div className="w-full py-20">
        <h1 className="text-center text-xl">Share progress with your friends.</h1>
      </div>

      <div className="w-full relative z-10 pb-40 flex justify-center">

        <div className="min-w-96 h-96 border rounded-lg bg-purple-400/10 backdrop-blur-sm flex flex-col">
          <div className="w-full flex items-center p-4 gap-4">
            <div className="rounded-full bg-background/40 p-4">
              <Trophy className="text-amber-300" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">New milestone reached!</p>
              <p className="text-sm">Went to the gym 150 days in a row!</p>
            </div>
            <Avatar>
              <AvatarImage src="https://images.pexels.com/photos/13020519/pexels-photo-13020519.jpeg?auto=compress&cs=tinysrgb&w=400" />
            </Avatar>
          </div>
          <div className="flex-grow p-4 flex flex-col">
            <div className="flex-grow flex flex-col gap-2">
              <div className="bg-background/40 border py-3 px-5 rounded-full translate-x-20">
                <p className="text-xs text-muted-foreground">2025-01-09 ~ 12:22</p>
                <p className="text-sm">Nice!</p>
              </div>
              <div className="bg-background/40 border py-3 px-5 rounded-full translate-x-10">
                <p className="text-xs text-muted-foreground">2025-01-09 ~ 14:59</p>
                <p className="text-sm">Wow... Catching up to me soon :{')'}</p>
              </div>
              <div className="bg-background/40 border py-3 px-5 rounded-full translate-x-0">
                <p className="text-xs text-muted-foreground">2025-01-09 ~ 20:19</p>
                <p className="text-sm">Huge accomplishment! Keep it up!</p>
              </div>
            </div>

            <div className="w-full h-12 flex gap-3">
              <div className="size-12 flex items-center justify-center rounded-full bg-background/20 relative">
                <div className="absolute h-56 w-12 bottom-full">
                  <FloatingHearts />
                </div>

                <SmilePlus className="size-6 text-muted-foreground" />
              </div>

              <div className="flex-grow bg-background/20 h-12 rounded-full flex items-center px-4">
                <p className="text-muted-foreground text-sm flex-grow">Send a message...</p>
                
                <Send className="text-muted-foreground size-5" />
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="h-52 w-full bg-gradient-to-b from-background dark:to-black to-white absolute bottom-0" />
    </div>
  )
}

const FloatingHearts = () => {
  const hearts = Array.from({ length: 5 }); // Number of hearts to render
  const emojis = ["❤️", "🙌", "💪", "😱"]

  const [isClient, setIsClient] = useState(false)
 
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <>
      {hearts.map((_, index) => (
        <motion.div
          key={index}
          className="absolute text-red-500 text-2xl"
          initial={{
            opacity: 0,
            y: 224,
            x: Math.random() * 40 - 20, // Random x-offset to make the effect dynamic
          }}
          animate={{
            opacity: [0, 1, 0], // Fade in and out
            y: -50, // Drift upwards
          }}
          transition={{
            duration: Math.random() * 2 + 3, // Randomize duration for variety
            repeat: Infinity, // Repeat infinitely
            delay: Math.random() * 10, // Stagger start time
          }}
        >
          {emojis[Math.floor(Math.random() * emojis.length)]}
        </motion.div>
      ))}
    </>
  );
};
