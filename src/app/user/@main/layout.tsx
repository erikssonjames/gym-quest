import { api } from "@/trpc/server";
import Navbar from "./_components/navbar";
import { redirectIfNoSession } from "@/lib/serverUtils";
import { UserSettingsProvider } from "./_components/user-settings-provider";
import { STANDARD_BORDER_RADIUS, STANDARD_COLOR_THEME } from "@/variables/settings";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await redirectIfNoSession()

  const { userSettings } = await api.user.getMe()

  return (
    <UserSettingsProvider 
      initialTheme={userSettings?.colorTheme ?? STANDARD_COLOR_THEME}
      initialBorderRadius={userSettings?.borderRadius ?? STANDARD_BORDER_RADIUS}
    >
      <Navbar />
      {children}
    </UserSettingsProvider>
  );
}
