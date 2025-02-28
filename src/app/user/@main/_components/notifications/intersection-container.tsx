import { useIntersectionObserver } from "@uidotdev/usehooks";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";

interface IntersectionContainerProps {
  children: ReactNode
  notificationContainerRef: RefObject<HTMLDivElement>
  onReadNotification: (id: string) => void
  notificationId: string
}

export default function IntersectionContainer(
  { children, notificationContainerRef, onReadNotification, notificationId }: IntersectionContainerProps
) {
  const [ref, entry] = useIntersectionObserver({
    threshold: 1,
    root: notificationContainerRef.current,
    rootMargin: '10px'
  })

  const triggeredRead = useRef(false)
  useEffect(() => {
    if (entry?.isIntersecting && !triggeredRead.current) {
      onReadNotification(notificationId)
      triggeredRead.current = true
    }
  }, [entry?.isIntersecting, notificationId, onReadNotification])

  return (
    <div ref={ref}>
      {children}
    </div>
  )
}