import { Inter, Hammersmith_One } from 'next/font/google'

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-sans'
})
const hammersmith = Hammersmith_One({
  weight: '400',
  subsets: ['latin']
})

export { inter, hammersmith }