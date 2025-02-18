import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/utilts/theme-provider";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { inter } from "@/styles/fonts";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { env } from "@/env";

export const metadata: Metadata = {
  title: "Gym Quest",
  description: 'Gamify your gym experience.',
  icons: {
    icon: [
      { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/icon/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/icon/favicon-16x16.png' },
    ],
    apple: { rel: 'apple-touch-icon', sizes: '180x180', url: '/icon/apple-touch-icon.png' },
    other: [
      { rel: 'manifest', url: '/icon/site.webmanifest' },
      { rel: 'shortcut icon', url: '/icon/favicon.ico' },
    ],
  }
};

export const viewport: Viewport = {
  initialScale: 1,
  minimumScale: 1,
  width: "device-width"
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning suppressContentEditableWarning>
      <body
        className={cn(
          'flex flex-col w-full min-h-dvh bg-background font-sans antialiased standard medium_radius',
          inter.variable
        )}
      >
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextIntlClientProvider messages={messages}>
              {children}
              <Toaster richColors />
            </NextIntlClientProvider>
          </ThemeProvider>
        </TRPCReactProvider>
        {env.NODE_ENV === "production" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
