'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/trpc/react'
import { TRPCClientError } from '@trpc/client'
import { motion } from 'framer-motion'
import { Check, LoaderCircle, SendHorizontal } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function WelcomeText() {
  const [email, setEmail] = useState<string>('')
  const { mutateAsync, variables, isPending, isSuccess } = api.user.joinWaitlist.useMutation()

  const onWaitlistSubmit = async () => {
    if (!isValidEmail(email)) return

    try {
      await mutateAsync({ email })

      toast.success('Success', {
        description: 'You have succesfully joined the waiting list!',
      })
    } catch (e) {
      if (e instanceof TRPCClientError) {
        toast.error('Error', {
          description: e.message,
        })
      }
    }
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

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
        <div className='relative'>
          <Button disabled className='px-10'>Get started today</Button>
          <div className='absolute top-8 left-2'>
            <p className='text-xs text-primary bg-primary-foreground py-1 px-3 rounded-md w-fit'>Coming soon ✨</p>
            <div className='ms-2 mt-1 flex w-72'>
              <svg className='w-10 h-20' viewBox='0 0 40 80'>
                <path fill='none' stroke="#9d31ff" strokeWidth='3px' d="M 5,0 V 55 Q 5,70 20,70 H 35,70" />
              </svg>
              <div className="w-full max-w-sm items-center self-end ms-2 mt-4">
                <Label htmlFor="email">Email</Label>
                <div className='relative'>
                  <Input 
                    type="email" id="email" placeholder="Join waitlist" className='py-4 ps-4 h-12 rounded-lg'
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                  {isValidEmail(email) && (
                    <Button 
                      onClick={onWaitlistSubmit}
                      variant="default" 
                      size="icon"
                      disabled={isPending}
                      className='absolute right-2 top-0 bottom-0 my-auto size-8'
                    >
                      {isPending ? (
                        <LoaderCircle className='size-4 animate-spin' />
                      ) : (
                        <>
                          {isSuccess && variables.email === email ? (
                            <Check className='size-4' />
                          ) : (
                            <SendHorizontal className='size-4' />
                          )}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button variant='outline'>Learn more</Button>
      </div>
    </div>
  )
}
1000 * 1000 * 1000