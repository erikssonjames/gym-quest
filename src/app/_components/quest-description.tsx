'use client'

import { cn } from "@/lib/utils"
import { 
  type MotionValue,
  motion,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence
} from "framer-motion"
import { MoveRight } from "lucide-react"
import { Fragment, useEffect, useRef, useState } from "react"

enum Difficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3
}
// type Difficulties = ''

function Quest(
  { title, task, amount, difficulty, scrollYProgress, start, end }: 
  { 
    title: string, 
    task: string, 
    amount: number, 
    difficulty: Difficulty,
    scrollYProgress: MotionValue<number>,
    start: number,
    end: number
  }
) {
  const [finished, setFinished] = useState(false)
  const [calculatedAmount, setCalculatedAmount] = useState(0)

  const getAmount = () => {
    if (amount === Infinity) {
      return '∞'
    } else if (amount > 99) {
      return `${Math.floor(calculatedAmount / amount * 100)}%`
    } else {
      return `${calculatedAmount}/${amount}`
    }
  }


  const circleMax = (amount === Infinity || amount > 20)
    ? 20
    : amount

  const strokeDashOffset = useTransform(scrollYProgress, [start, end], [circleMax, 0])

  useEffect(() => {
    strokeDashOffset.on('change', (n) => {
      if (n <= 0.25) setFinished(true)
      else setFinished(false)

      const percentage = n / circleMax
      const percentageAmount = percentage * amount
      const num = percentage > 0.01 ? Math.floor(amount - percentageAmount) : amount
      setCalculatedAmount(num)
    })
  }, [strokeDashOffset, circleMax, amount])

  return (
    <div className="bg-black/50 border border-slate-950/20 rounded-full p-4 flex justify-between items-center min-w-[300px]">
      <div className="size-12 relative">
        <svg
          className="size-12"
          viewBox="0 0 48 48"
        >
          <circle r={22} stroke="#505050" strokeWidth={3} cx={24} cy={24} />
          <motion.circle 
            strokeLinecap="round"
            r={22}
            stroke={finished ? '#ffe24f' : '#fff'}
            strokeWidth={3} 
            cx={24} cy={24} strokeDasharray={circleMax}
            pathLength={circleMax}
            strokeDashoffset={strokeDashOffset}
          />
        </svg>
        <div className="absolute flex items-center justify-center inset-0">
          <p className={cn(
            amount === Infinity ? "text-2xl mt-1" : "",
            amount > 99 ? 'text-sm' : '',
            amount === calculatedAmount ? 'text-white' : 'text-gray-500'
          )}>
            {getAmount()}
          </p>
        </div>
      </div>
      <div className="flex-grow px-4 md:px-8">
        <h3 className={cn(
          "text-xs",
          difficulty === Difficulty.EASY && "text-emerald-500",
          difficulty === Difficulty.MEDIUM && "text-amber-400",
          difficulty === Difficulty.HARD && "text-primary"
        )}>{title}</h3>
        <p>{task}</p>
      </div>
    </div>
  )
}

const getStartEndValues = (
  min: number, 
  max: number, 
  offset: number,
  length: number,
  partitions: number
) => {
  const partitionLength = (max - min) / partitions
  const startValue = (max - min) + (offset * partitionLength);
  const endValue =  startValue + (length * partitionLength)

  if (startValue > max || endValue > max) {
    return {
      start: min,
      end: max
    }
  }

  return { start: startValue, end: endValue };
};

function ExplainQuests (
  { scrollYProgress, endValue, startValue }: 
  { scrollYProgress: MotionValue<number>, endValue: number, startValue: number }
) {
  return (
    <motion.div 
      // transition={{ duration: 1 }}.0
      initial={{ opacity: 0, y: '50%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: '-100%' }}
      className="w-full h-full gap-2 p-10 absolute top-0 left-0 bg-background/70 flex flex-col rounded-3xl"
    >
      <div>
        <h2 className="text-3xl text-center">Turn <span className="text-primary">Actions</span> into quests.</h2>
      </div>
      <div className="flex flex-col flex-grow justify-center">
        <div className="flex flex-col gap-3 flex-grow justify-around max-h-[1000px] px-10 py-6 lg:py-24">
          <div className="w-full flex items-center justify-center gap-10">
            <div className="items-center hidden md:flex">
              <p>{'"I want to improve my consistency..."'}</p>
            </div>
            <MoveRight />
            <Quest
              title="Gym attendance"
              task="Visit the gym 2 times this week"
              amount={2}
              difficulty={Difficulty.EASY}
              scrollYProgress={scrollYProgress}
              // start={startValue}
              // end={endValue - ((endValue - startValue) / 3)}
              {...getStartEndValues(startValue, endValue, 1, 3, 5)}
            />
          </div>
          <div className="w-full flex items-center justify-center gap-10">
            <div className="hidden md:flex items-center">
              <p>{'"I want to do 1000 pushups in a week..."'}</p>
            </div>
            <MoveRight />
            <Quest
              title="Pushups"
              task="Do 1000 pushups in a week"
              amount={1000}
              difficulty={Difficulty.MEDIUM}
              scrollYProgress={scrollYProgress}
              // start={startValue}
              // end={endValue - ((endValue - startValue) / 2)}
              {...getStartEndValues(startValue, endValue, 3, 4, 8)}
            />
          </div>
          <div className="w-full flex items-center justify-center gap-10">
            <div className="hidden md:flex items-center">
              <p>{'"I want to do 1000 pushups in a week..."'}</p>
            </div>
            <MoveRight />
            <Quest
              title="Gym attendance"
              task="Visit the gym 7 times this week"
              amount={7}
              difficulty={Difficulty.HARD}
              scrollYProgress={scrollYProgress}
              // start={startValue}
              // end={endValue - ((endValue - startValue))}
              {...getStartEndValues(startValue, endValue, 0, 4, 5)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const useTransforms = (
  scrollYProgress: MotionValue<number>, 
  startValue: number,
  endValue: number,
  fraction: number, 
  initialX: number
) => {
  const x = useTransform(scrollYProgress, [startValue, endValue / fraction], [initialX, 0]);
  const opacity = useTransform(scrollYProgress, [startValue, endValue / fraction], [0, 1]);

  return { x, opacity };
};

function ExplainGamify (
  { scrollYProgress, endValue, startValue }: 
  { scrollYProgress: MotionValue<number>, endValue: number, startValue: number }
) {
  const t1 = useTransforms(scrollYProgress, startValue, endValue, 6, 800);
  const t2 = useTransforms(scrollYProgress, startValue, endValue, 4, 400);
  const t3 = useTransforms(scrollYProgress, startValue, endValue, 2, 600);

  const titleOpacity = useTransform(scrollYProgress, [startValue, endValue / 8], [0, 1])

  return (
    <motion.div 
      className="flex-grow w-full h-full justify-center flex gap-2 pb-20 ps-6 absolute top-0 left-0"
      transition={{ duration: 0.5 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: '-100%' }}
    >
      <div className="flex flex-col justify-center">
        <motion.h2 
          className="text-center text-base md:text-2xl pb-4 text-gray-300"
          style={{ opacity: titleOpacity }}
        >
          Our three core concepts
        </motion.h2>
        <div className="flex-col flex justify-end items-end gap-3">

          <motion.div 
            className="py-5 px-6 md:py-10 md:px-12 rounded-3xl bg-black/60 border border-border/30 flex justify-center items-center"
            transition={{ type: 'spring' }}
            style={{ x: t1.x, opacity: t1.opacity }}
          >
            <h1 className="text-lg md:text-5xl">
              We believe in the strength of <span className="text-violet-600">gamification</span>.
            </h1>
          </motion.div>

          
          <motion.div 
            className="py-5 px-6 md:py-10 md:px-12 rounded-3xl bg-black/60 border border-border/30 flex justify-center items-center"
            transition={{ type: 'spring' }}
            style={{ x: t2.x, opacity: t2.opacity }}
          >
            <h1 className="text-lg md:text-5xl">
              Constistency is <span className="text-violet-600">king</span>.
            </h1>
          </motion.div>

          
          <motion.div 
            className="py-5 px-6 md:py-10 md:px-12 rounded-3xl bg-black/60 border border-border/30 flex justify-center items-center"
            transition={{ duration: 1, type: 'spring', delay: 0.5 }}
            style={{ x: t3.x, opacity: t3.opacity }}
          >
            <h1 className="text-lg md:text-5xl">
              Working out should be <span className="text-violet-600">fun</span>.
            </h1>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function ScrollProgressComponent (
  { scrollYProgress, steps, activeStep }: 
  { scrollYProgress: MotionValue<number>, steps: number, activeStep: number }
) {
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null);
  const [svgHeight, setSvgHeight] = useState<number>(0)
  const [circlePositions, setCirclePositions] = useState<{ x: number, y: number }[]>([]);

  const strokeDashOffsetSpring = useSpring(
    useTransform(scrollYProgress, [0, 1], [1, 0]),
    {
      stiffness: 500,
      damping: 90,
    }
  );

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return
    const totalPathLength = path.getTotalLength();
    const positions = [];

    for (let i = 0; i < steps; i++) {
      const atLength = Math.min(totalPathLength, (totalPathLength / (steps - 1)) * i) + (
        i === 0
          ? 10
          : i === (steps - 1)
            ? -10
            : 0
      )
      const pointAtLength = path.getPointAtLength(atLength);
      positions.push({ x: pointAtLength.x, y: pointAtLength.y });
    }

    setCirclePositions(positions);
  }, [steps, svgHeight]);

  useEffect(() => {
    const onResize = () => {
      if (svgContainerRef.current) {
        setSvgHeight(svgContainerRef.current.offsetHeight)
      }
    }

    onResize()
    window.addEventListener('resize', onResize)
    window.addEventListener('focus', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('focus', onResize)
    }
  }, [])

  return (
    <div 
      className="absolute top-72 bottom-10"
      ref={svgContainerRef}
    >
      <svg 
        viewBox={`0 0 50 ${svgHeight}`}
        width="50"
        height={svgHeight}
        className="block"
        aria-hidden
      >
        <motion.path
          d={`M 30 10 V ${svgHeight * 0.6} l -10 10 V ${svgHeight - 10}`}
          fill="none"
          stroke="#9091A0"
          strokeOpacity="0.16"
          transition={{
            duration: 10,
          }}
          ref={pathRef}
        />
        <motion.path
          d={`M 30 10 V ${svgHeight * 0.6} l -10 10 V ${svgHeight - 10}`}
          fill="none"
          stroke="hsla(268, 100%, 34%, 1)"
          strokeWidth="3px"
          strokeDasharray={1}
          strokeDashoffset={strokeDashOffsetSpring}
          pathLength={1}
        />
        {circlePositions.map((pos, index) => (
          <Fragment key={`circles-fragment-${index}`}>
            <circle key={`outer-${index}`} cx={pos.x} cy={pos.y} r={10} strokeWidth={2} opacity="1" />  
            <circle key={`middle-${index}`} cx={pos.x} cy={pos.y} r={8} stroke="#fff" strokeWidth={2} opacity="0.2" />
            <circle key={`inner-${index}`} cx={pos.x} cy={pos.y} r={4} fill="#fff" opacity="0.2" />

            <circle
              key={`highlight-${index}`}
              cx={pos.x}
              cy={pos.y}
              r={8}
              fill="hsl(var(--primary))"
              className="transition-all"
              style={{
                opacity: activeStep >= index ? 1 : 0,
              }}
            />
            <circle
              key={`blurred-${index}`}
              cx={pos.x}
              cy={pos.y}
              r={20}
              fill="url(#purpleGradient)"
              filter="url(#blurFilter)"
              className="transition-all"
              style={{
                opacity: activeStep >= index ? 0.6 : 0,
              }}
            />
          </Fragment>
        ))}

        <defs>
          <radialGradient id="purpleGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style={{ stopColor: "#800080", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0 }} />
          </radialGradient>
          <filter id="blurFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}

export default function GymDescription () {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end 105%"]
  })

  const [activeStep, setActiveStep] = useState<number>(0)

  const steps = 3 // Extra step added for ScrollProgressComponent
  const currentStep = useTransform(
    scrollYProgress,
    [0, 1],
    [0, steps - 1]
  );

  useEffect(() => {
    currentStep.on('change', (latestValue) => {
      setActiveStep(Math.floor(latestValue))
    })
  }, [currentStep])

  const getStartEndValues = (index: number) => {
    const start = index / (steps - 1)
    const end = (index + 1) / (steps - 1)
    return { 
      startValue: start,
      endValue: end
    }
  }

  return (
    <div 
      className="min-h-[400vh] h-[400vh] flex w-full px-2 md:px-10 relative"
      ref={containerRef}
    >
      <div className="absolute h-full w-full top-0 left-0">
        <div className="sticky top-0 h-1/4 w-full bg-grid-white/[0.1] flex items-center justify-center">
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_5%,black)]"></div>
        </div>
      </div>
      <div className="sticky w-screen h-dvh self-start xl:px-20 pt-24 pb-10 top-0 flex flex-col justify-start gap-10 overflow-hidden">
        <div className="w-full flex flex-col justify-start md:px-0 px-4">
          <h1 className="text-lg md:text-3xl w-fit" id="QUESTDESCRIPTION-START">Quests + Gym?</h1>
          <p className="text-primary">Let us explain..</p>
        </div>

        <ScrollProgressComponent 
          scrollYProgress={scrollYProgress} 
          steps={steps} 
          activeStep={activeStep}
        />

        <div className="w-full h-full ps-12">
          <div className="w-full h-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <ExplainGamify 
                  scrollYProgress={scrollYProgress} 
                  {...getStartEndValues(0)}
                />
              )}
              {activeStep >= 1 && (
                <ExplainQuests 
                  scrollYProgress={scrollYProgress}
                  {...getStartEndValues(1)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
} 