import { api } from "@/trpc/server";
import Navbar from "./_components/navbar";
import { redirectIfNoSession } from "@/lib/serverUtils";
import { UserSettingsProvider } from "./_components/user-settings-provider";
import { STANDARD_BORDER_RADIUS, STANDARD_COLOR_THEME } from "@/variables/settings";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/sidebar/app-sidebar";
import packageJson from "../../../../package.json";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await redirectIfNoSession()

  const { userSettings } = await api.user.getMe()
  const appVersion = process.env.APP_VERSION || packageJson.version

  return (
    <UserSettingsProvider 
      initialTheme={userSettings?.colorTheme ?? STANDARD_COLOR_THEME}
      initialBorderRadius={userSettings?.borderRadius ?? STANDARD_BORDER_RADIUS}
    >
      <SidebarProvider>
        <AppSidebar appVersion={appVersion} />
        <SidebarInset>
          <Navbar />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </UserSettingsProvider>
  );
}
