import { api } from "@/trpc/server";
import Navbar from "./_components/navbar";
import { redirectIfNoSession } from "@/lib/serverUtils";
import { UserSettingsProvider } from "./_components/user-settings-provider";
import { STANDARD_BORDER_RADIUS, STANDARD_COLOR_THEME } from "@/variables/settings";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/sidebar/app-sidebar";
import DynamicLayout from "./_components/dynamic-layout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await redirectIfNoSession()

  const { userSettings } = await api.user.getMe()

  return (
    <UserSettingsProvider 
      initialTheme={userSettings?.colorTheme ?? STANDARD_COLOR_THEME}
      initialBorderRadius={userSettings?.borderRadius ?? STANDARD_BORDER_RADIUS}
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Navbar />
          <DynamicLayout>
            <div className="min-h-full h-full">
              <div className="min-h-full h-full flex flex-col max-w-6xl mx-auto px-4 md:px-10">
                {children}
              </div>
            </div>
          </DynamicLayout>
        </SidebarInset>
      </SidebarProvider>
    </UserSettingsProvider>
  );
}
