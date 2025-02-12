'use client'

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export default function PagePath () {
  const progressX = useMotionValue(0)
  const progressY = useMotionValue(0)

  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 90%", "end center"]
  })

  const strokeDashOffsetSpring = useSpring(
    useTransform(
      scrollYProgress,
      [0, 1],
      [1, 0]
    ),
    {
      stiffness: 500,
      damping: 90,
    }
  )

  const circleRadius = useTransform(
    scrollYProgress,
    [0, 0.7, 1],
    [5, 5, 0]
  )

  const pathRef = useRef<SVGPathElement>(null)
  const [width, setWidth] = useState<number>(0)

  useEffect(() => {
    const handleResize = () => {
      if (!targetRef.current) return

      setWidth(targetRef.current.getBoundingClientRect().width)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('focus', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('focus', handleResize)
    }
  }, [])

  useEffect(() => {
    if (!pathRef.current) return

    const totalPathLength = pathRef.current.getTotalLength()
    const initialValue = strokeDashOffsetSpring.get()

    const initialCoords = pathRef.current.getPointAtLength(
      Math.max(totalPathLength - (totalPathLength * initialValue), 20)
    )

    progressX.set(initialCoords.x)
    progressY.set(initialCoords.y)

    const unsubscribe = strokeDashOffsetSpring.on('change', (latestValue) => {
      if (!pathRef.current) return
      const latestsPathProgress = pathRef.current.getPointAtLength(
        Math.max(totalPathLength - (totalPathLength * latestValue), 20)
      )

      progressX.set(latestsPathProgress.x)
      progressY.set(latestsPathProgress.y)
    })

    return unsubscribe
  }, [progressX, progressY, strokeDashOffsetSpring, width])

  return (
    <section className="w-full justify-center items-start hidden lg:flex" style={{ height: 600 }}>
      <div className="ps-20 pe-48 max-w-[1400px] w-full h-full">
        <div
          ref={targetRef}
          className="w-full h-full relative" 
        >
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${width} 600`}
            xmlns="http://www.w3.org/2000/svg" 
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <filter id="circleGradient">
              <feGaussianBlur stdDeviation="2" />
            </filter>

            <path 
              d={`M ${width - 10} 0 v 100 c 0 200, -200 200, -200 200 
                  h -${width - 420} c -200 0, -200 200, -200 200 v 100`}
              preserveAspectRatio="true"
              fill="none"
              stroke="#757575"
              strokeWidth="2px"
              strokeDasharray={1}
              strokeDashoffset={0}
              pathLength={1}
              ref={pathRef}
            />
            <motion.path 
              d={`M ${width - 10} 0 v 100 c 0 200, -200 200, -200 200 
              h -${width - 420} c -200 0, -200 200, -200 200 v 100`}
              fill="none"
              stroke="#9d31ff"
              strokeWidth="4px"
              strokeDasharray={1}
              strokeDashoffset={strokeDashOffsetSpring}
              pathLength={1}
            />
            <motion.circle
              filter="url(#circleGradient)"
              r={circleRadius}
              cx={progressX}
              cy={progressY}
              fill="#811cdd"
            />
          </svg>
          <div
            className="absolute left-0 bottom-0 w-5 h-24 bg-gradient-to-b from-transparent via-background/80 to-background"
          />
        </div>
      </div>
    </section>
  )
}
