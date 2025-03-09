import DynamicLayoutWithScroll from "../_components/dynamic-layout-with-scroll"

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicLayoutWithScroll>
      <div className="min-h-full h-full flex flex-col max-w-6xl mx-auto px-4 pt-4 md:pt-6 md:px-10">
        {children}
      </div>
    </DynamicLayoutWithScroll>
  );
}
