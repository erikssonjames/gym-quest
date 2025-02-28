import DynamicLayoutWithScroll from "../_components/dynamic-layout-with-scroll";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DynamicLayoutWithScroll>
      <div className="min-h-full h-full flex flex-col">
        {children}
      </div>
    </DynamicLayoutWithScroll>
  );
}
