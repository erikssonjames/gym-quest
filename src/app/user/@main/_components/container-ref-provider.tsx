"use client"

import { createContext, forwardRef, type ReactNode, type RefObject, useContext } from "react"

const ContainerRefContext = createContext<RefObject<HTMLDivElement> | null>(null);

const ContainerRefProvider = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref) => {
    return (
      <ContainerRefContext.Provider value={ref as RefObject<HTMLDivElement>}>
        {children}
      </ContainerRefContext.Provider>
    );
  }
)
ContainerRefProvider.displayName = "ScrollProvider"

export default ContainerRefProvider

export function useContainerRef() {
  const context = useContext(ContainerRefContext);
  if (!context) {
    throw new Error("useContainerRef must be used within a ContainerRefProvider");
  }
  return context;
}
