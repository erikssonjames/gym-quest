"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

export default function ErrorIndicator () {
  const searchParams = useSearchParams()
  const hasLoaded = useRef(false)


  useEffect(() => {
    if (hasLoaded.current) return

    const delayedToast = (text: string) => {
      setTimeout(() => {
        toast.error(text)
      }, 200)
    }

    const error = searchParams.get("error")

    if (error) {
      switch (error) {
      case "OAuthAccountNotLinked": {
        delayedToast("An Account with that email already exists.")
        break;
      }
      default: {
        delayedToast("Unknown error.")
      }
      }
    }

    hasLoaded.current = true
  }, [searchParams])

  return null
}