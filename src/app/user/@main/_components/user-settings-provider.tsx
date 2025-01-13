'use client'

import { type UserGetMeOutput } from '@/server/api/types/output';
import { type NewUserSettings } from '@/server/db/schema/user';
import { api,  } from '@/trpc/react';
import { STANDARD_BORDER_RADIUS, STANDARD_COLOR_THEME, type BORDER_RADIUS, type COLOR_THEMES } from '@/variables/settings';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import React, { createContext, useContext, useEffect } from 'react';

interface ThemeContextType extends Partial<NewUserSettings> {
    updateUserSettings: (userSettings: Partial<NewUserSettings>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const UserSettingsProvider = (
    { children, initialTheme, initialBorderRadius }: 
    { children: React.ReactNode, initialTheme: COLOR_THEMES, initialBorderRadius: BORDER_RADIUS }
) => {
  const { data: user } = api.user.getMe.useQuery()
  const getMeQueryKey = getQueryKey(api.user.getMe, undefined, 'query')
  const queryClient = useQueryClient()
  const { mutate } = api.user.updateUserSettings.useMutation({
    onMutate: async (updatedSettings) => {
      await queryClient.cancelQueries({ queryKey: getMeQueryKey })
      const cachedUserData: UserGetMeOutput | undefined = queryClient.getQueryData(getMeQueryKey)
      if (!cachedUserData) return
      const updatedUserData: UserGetMeOutput = {
        ...cachedUserData,
        userSettings: {
          userId: cachedUserData.id,
          borderRadius: updatedSettings.borderRadius ?? cachedUserData.userSettings?.borderRadius ?? STANDARD_BORDER_RADIUS,
          colorTheme: updatedSettings.colorTheme ?? cachedUserData.userSettings?.colorTheme ?? STANDARD_COLOR_THEME
        }
      }
      queryClient.setQueryData(getMeQueryKey, updatedUserData)
      return { cachedUserData, updatedSettings }
    },
    onError: (err, updatedSettings, context) => {
      queryClient.setQueryData(
        getMeQueryKey,
        context?.cachedUserData
      )
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: getMeQueryKey })
    }
  })

  const updateUserSettings = (userSettings: Partial<NewUserSettings>) => {
    mutate(userSettings)
  }

  const theme = user?.userSettings?.colorTheme ?? initialTheme
  const borderRadius = user?.userSettings?.borderRadius ?? initialBorderRadius

  useEffect(() => {
    const htmlEl = document.querySelector('html')
    if (htmlEl) {
      const isDark = htmlEl.classList.contains("dark")
      htmlEl.className = ''
      htmlEl.classList.add(theme, borderRadius)
      if (isDark) htmlEl.classList.add("dark")
    }
  }, [theme, borderRadius])

  return (
    <ThemeContext.Provider value={{ ...(user?.userSettings ?? {}), updateUserSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useUserSettings = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useUserSsettings must be used within a UserSettingsProvider")
  }
  return context
}