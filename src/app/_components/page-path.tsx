'use client'

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

export default function PagePath () {
  const progressX = useMotionValue(0)
  const progressY = useMotionValue(0)

  const targetRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 60%", "end center"]
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

  const [path, setPath] = useState<SVGPathElement | null>(null)
  const [position, setPosition] = useState<{
    xStart: number | null,
    yStart: number | null,
    xEnd: number | null,
    yEnd: number | null,
    innerWidth: number | null,
  }>({
    xStart: null,
    xEnd: null,
    yStart: null,
    yEnd: null,
    innerWidth: null
  })

  const pathRef = useCallback((node: SVGPathElement | null) => {
      setPath(node)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      let obj: {
        xStart: number | null,
        yStart: number | null,
        xEnd: number | null,
        yEnd: number | null,
        innerWidth: number | null
      } = {
        xStart: null,
        xEnd: null,
        yStart: null,
        yEnd: null,
        innerWidth: null
      }

      const startElement = document.getElementById('GYMQUESTER-END')
      if (startElement) {
        const { left, width, bottom } = startElement.getBoundingClientRect()
        const topPosition = window.scrollY + bottom + 50
        const startPosition = left + (width / 2)
        obj = {
          ...obj,
          xStart: startPosition,
          yStart: topPosition
        }
      }

      const endElement = document.getElementById('QUESTDESCRIPTION-START')
      if (endElement) {
        const { left, width, top } = endElement.getBoundingClientRect()
        const bottomPosition = window.scrollY + top
        const endPosition = left + (width / 2)
        obj = {
          ...obj,
          xEnd: endPosition,
          yEnd: bottomPosition
        }
      }

      if (typeof window !== "undefined") {
        obj.innerWidth = window.innerWidth
      }

      if (Object.values(obj).some(v => v !== null)) {
        setPosition(prev => {
          const newObj = { ...prev }
          if (obj.xEnd && obj.xEnd !== newObj.xEnd) newObj.xEnd = obj.xEnd
          if (obj.xStart && obj.xStart !== newObj.xStart) newObj.xStart = obj.xStart
          if (obj.yEnd && obj.yEnd !== newObj.yEnd) newObj.yEnd = obj.yEnd
          if (obj.yStart && obj.yStart !== newObj.yStart) newObj.yStart = obj.yStart
          if (obj.innerWidth && obj.innerWidth !== newObj.innerWidth) newObj.innerWidth = obj.innerWidth
          return newObj
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!path) return

    const totalPathLength = path.getTotalLength()
    const initialValue = strokeDashOffsetSpring.get() as number

    const initialCoords = path.getPointAtLength(
      Math.max(totalPathLength - (totalPathLength * initialValue), 20)
    )

    progressX.set(initialCoords.x)
    progressY.set(initialCoords.y)

    const unsubscribe = strokeDashOffsetSpring.on('change', (latestValue) => {
      const latestsPathProgress = path.getPointAtLength(
        Math.max(totalPathLength - (totalPathLength * latestValue), 20)
      )

      progressX.set(latestsPathProgress.x)
      progressY.set(latestsPathProgress.y)
    })

    return unsubscribe
  }, [progressX, progressY, strokeDashOffsetSpring, path, position])

  const width = (position.xEnd && position.xStart) ?
    position.xStart - position.xEnd
    : 0

  const height = (position.yStart && position.yEnd) ?
    position.yEnd - position.yStart
    : 0

  return (
      <>
        <div className="py-96" />
        <div
          ref={targetRef}
          className="absolute w-full h-full left-0 right-0 z-10s" 
          style={{ top: position.yStart ?? 0, height: height - 200 }}>
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${position.innerWidth ?? 0} ${height - 200}`}
            xmlns="http://www.w3.org/2000/svg" 
            xmlnsXlink="http://www.w3.org/1999/xlink" 
          >
            <filter id="circleGradient">
              <feGaussianBlur stdDeviation="2" />
            </filter>

            <path 
              d={`M ${position.xStart ?? 0} 0 v 200 c 0 200, -200 200, -200 200 
                  h -${width - 400} c -200 0, -200 200, -200 200 v ${height - 800}`}
              fill="none"
              stroke="#757575"
              strokeWidth="2px"
              strokeDasharray={1}
              strokeDashoffset={0}
              pathLength={1}
              ref={pathRef}
            />
            <motion.path 
              d={`M ${position.xStart ?? 0} 0 v 200 c 0 200, -200 200, -200 200 
                  h -${width - 400} c -200 0, -200 200, -200 200 v ${height - 800}`}
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
            className="absolute bottom-0 w-28 bg-gradient-to-b from-transparent via-background to-background"
            style={{
              left: position.xEnd ? position.xEnd - 56 : 0,
              height: (height - 400) / 2
            }}
          />
        </div>
      </>
  )
}
