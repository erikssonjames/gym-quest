import { createContext, forwardRef, type ReactNode, type RefObject, useContext, useEffect, useState } from "react";

export const ScrollContext = createContext<{ isScrolled: boolean, ref?: RefObject<HTMLDivElement> }>({ isScrolled: false })

function useIsScrolled(ref: RefObject<HTMLDivElement>) {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    const handleScroll = () => {
      setIsScrolled(element.scrollTop > 10); // Detect scroll position
    };
  
    element.addEventListener("scroll", handleScroll, true);
    return () => {
      if (element) {
        element.removeEventListener("scroll", handleScroll, true)
      }
    }
  }, [ref]);

  return { isScrolled, ref }
}

export function useCheckIfScrolled() {
  return useContext(ScrollContext)
}

const ScrollProvider = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref) => {
    const isScrolled = useIsScrolled(ref as RefObject<HTMLDivElement>)

    return (
      <ScrollContext.Provider value={isScrolled}>
        {children}
      </ScrollContext.Provider>
    );
  }
)
ScrollProvider.displayName = "ScrollProvider"

export default ScrollProvider