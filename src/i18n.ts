import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  let locale = 'en'

  const cookieLocale = cookies().get('locale')?.value
  if (cookieLocale) {
    locale = cookieLocale
  }

  return {
    locale,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    messages: (await import(`../messages/${locale}.json`)).default
  }
})