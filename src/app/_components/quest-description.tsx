'use client'

import { cn } from "@/lib/utils"
import { motion, useInView, useScroll, useSpring } from "framer-motion"
import { useEffect, useRef } from "react"

function ShowQuests () {
  return (
    <div className="flex-grow w-full flex gap-2 p-10">
      <div className="flex flex-col gap-3">
        <Quest
          title="Gym attendance"
          task="Visit the gym 3 times this week"
          amount={3}
        />
        <Quest
          title="Push ups streak"
          task="Perform 10000 pushups in a month"
          amount={10000}
        />
        <Quest
          title="Hit the treadmill"
          task="Walk 2km every day as long as possible!"
          amount={Infinity}
        />
      </div>

      <div className="border">
        
      </div>
    </div>
  )
}

function ExplainGamify () {
  return (
    <div className="flex-grow w-full h-full justify-center items-center flex gap-2 pb-20">
      <div>
        <motion.h2 className="text-center text-2xl pb-4 text-gray-300">Our three core concepts</motion.h2>
        <div className="flex-col flex justify-end items-end gap-3">

          <motion.div 
            className="py-10 px-12 rounded-3xl bg-black/30 border border-border/30 flex justify-center items-center"
            initial={{ opacity: 0, x: 400 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, type: 'spring', delay: 0.5 }}
          >
            <h1 className="text-5xl">
              We believe in the strength of <span className="text-violet-600">gamification</span>.
            </h1>
          </motion.div>

          
          <motion.div 
            className="py-10 px-12 rounded-3xl bg-black/30 border border-border/30 flex justify-center items-center"
            initial={{ opacity: 0, x: 400 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, type: 'spring', delay: 0.5 }}
          >
            <h1 className="text-5xl">
              Constistency is <span className="text-violet-600">king</span>.
            </h1>
          </motion.div>

          
          <motion.div 
            className="py-10 px-12 rounded-3xl bg-black/30 border border-border/30 flex justify-center items-center"
            initial={{ opacity: 0, x: 400 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, type: 'spring', delay: 0.5 }}
          >
            <h1 className="text-5xl">
              Working out should be <span className="text-violet-600">fun</span>.
            </h1>
          </motion.div>
        </div>
      </div>

    </div>
  )
}

function Quest(
  { title, task, amount }: 
  { title: string, task: string, amount: number }
) {
  const getAmount = () => {
    if (amount === Infinity) {
      return '∞'
    } else if (amount > 99) {
      return '0%'
    } else {
      return `1/${amount}`
    }
  }

  return (
    <div className="bg-black/50 border border-slate-950/20 rounded-full p-4 flex justify-between items-center">
      <div className="size-12 relative">
        <svg
          className="size-12"
          viewBox="0 0 48 48"
        >
          <circle r={22} stroke="#505050" strokeWidth={3} cx={24} cy={24} />
          <circle 
            strokeLinecap="round"
            r={22} stroke="#fff" strokeWidth={3} 
            cx={24} cy={24} strokeDasharray={3}
            strokeDashoffset={2}
            pathLength={3} />
        </svg>
        <div className="absolute flex items-center justify-center inset-0">
          <p className={cn(
            "text-gray-500",
            amount === Infinity ? "text-2xl mt-1" : "text-sm"
          )}>
            {getAmount()}
          </p>
        </div>
      </div>
      <div className="flex-grow px-8">
        <h3 className="text-primary text-xs">{title}</h3>
        <p>{task}</p>
      </div>
    </div>
  )
}

export default function GymDescription () {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    // container: containerRef,
    target: containerRef
  })

  return (
    <div 
      className="min-h-[400vh] h-[400vh] flex w-full px-10 relative"
      ref={containerRef}
    >
      <div className="absolute h-full w-full top-0 left-0">
        <div
          className="sticky top-0 h-1/4 w-full bg-grid-white/[0.05] flex items-center justify-center"
        >
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_5%,black)]"></div>
        </div>
      </div>
      <div className="sticky w-screen h-screen self-start px-20 pt-44 pb-10 top-0 flex flex-col gap-10">
        <div className="w-full flex flex-col justify-start">
          <h1 className="text-3xl w-fit" id="QUESTDESCRIPTION-START">Quests + Gym?</h1>
          <p className="text-primary">Let us explain..</p>
        </div>

        <ExplainGamify />
      </div>
    </div>
  )
} 