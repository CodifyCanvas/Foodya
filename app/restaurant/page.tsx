// app/restaurant/(restaurant)/page.tsx
import { redirect } from 'next/navigation'

const WelcomePage = () => {
  redirect('/restaurant/dashboard')
}

export default WelcomePage