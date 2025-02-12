import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, type ReactNode, Children } from "react";

interface ScrollContainerFadingEdgesProps {
    className?: string
    children: ReactNode
}

export default function ScrollContainerFadingEdges({ className, children }: ScrollContainerFadingEdgesProps) {
  const [maskStyle, setMaskStyle] = useState("mask-gradient-full");
  const scrollRef = useRef<HTMLDivElement>(null);

  const prevChildrenCount = useRef(Children.count(children));
  useEffect(() => {
    if (!scrollRef.current) return;

    // Scroll to bottom when a new child is added
    const scrollElement = scrollRef.current;
    if (Children.count(children) > prevChildrenCount.current) {
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: "smooth", // Smooth scrolling effect
      });
    }
  
    prevChildrenCount.current = Children.count(children)
  }, [children]); // Re-run when children change
  
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
  
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

      const atTop = scrollTop === 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight;
  
      if (atTop && atBottom) {
        setMaskStyle("mask-gradient-none");
      } else if (atTop) {
        setMaskStyle("mask-gradient-top");
      } else if (atBottom) {
        setMaskStyle("mask-gradient-bottom");
      } else {
        setMaskStyle("mask-gradient-full");
      }
    };
  
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      handleScroll(); // Run initially to set correct state
    }
  
    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div 
      className={cn(
        "relative overflow-y-auto scrollbar-hide",
        className,
        maskStyle
      )}
      ref={scrollRef}
    >
      {children}
    </div>
  );
}
