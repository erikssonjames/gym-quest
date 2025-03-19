import { auth } from "@/auth";
import DynamicLayoutWithScroll from "../_components/dynamic-layout-with-scroll"
import { redirect } from "next/navigation";
import RedirectNonAdminClientSide from "./_components/redirect-non-admin-client-side";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (session?.user.role !== "admin") {
    redirect("/user")
  }

  return (
    <DynamicLayoutWithScroll>
      <RedirectNonAdminClientSide />
      <div className="min-h-full h-full flex flex-col max-w-6xl mx-auto px-4 pt-4 md:pt-6 md:px-10">
        {children}
      </div>
    </DynamicLayoutWithScroll>
  );
}
