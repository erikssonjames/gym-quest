import { cookies } from 'next/headers';

interface CookieData {
  key: string,
  value: string,
  expireDate: Date
}
export async function createCookie(data: CookieData) {
  cookies().set(data.key, data.value, {
    expires: data.expireDate
  })
}

export async function getCookieValue(key: string) {
  return cookies().get(key)
}