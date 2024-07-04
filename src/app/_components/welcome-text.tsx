'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export default function WelcomeText() {
  return (
    <div className="flex justify-start flex-col">
      <h1 className="text-7xl text-primary font-bold">Working out,</h1>
      <motion.div
        transition={{
          delay: 1,
          type: 'spring',
          bounce: 0.7,
          duration: 1
        }}
        initial={{ y: 50, opacity: 0 }}
        animate={{
          opacity: 100,
          y: [null, -5, 20, 0]
        }}
      >
        <h1 className="text-5xl">
          But with a 
          <motion.span
            className='origin-top-right inline-block relative translate-x-4 overflow-hidden'
            transition={{
              delay: 1.05,
              duration: 0.3,
              ease: [0, 0.71, 0.2, 1.01],
              damping: 5,
              stiffness: 100,
              restDelta: 0.001,
              type: 'spring'
            }}
            initial={{ rotate: 0, translateX: 16 }}
            animate={{ rotate: -10, translateX: 16 }}
          >
            twist.
            <motion.div 
              className='absolute block bottom-0 border-b-4 border-primary w-full'
              transition={{
                duration: 0.3,
                delay: 1.5,
                damping: 5,
                stiffness: 100,
                restDelta: 0.001,
                type: 'spring'
              }}
              initial={{ x: 150 }}
              animate={{ x: 0 }}
            />
          </motion.span>
        </h1>
      </motion.div>

      <div className='flex gap-3 mt-10'>
        <Button className='px-10'>Get started today</Button>
        <Button variant='outline'>Learn more</Button>
      </div>
    </div>
  )
}