import { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: '404 - Page Not Found | Foodya',
  description: "Oops! The page you're looking for doesn't exist. Explore delicious food and restaurants on Foodya.",
}

export default function NotFound() {
  return (
    <main className="w-[100vw] h-[100vh] flex flex-1 bg-white rounded-lg justify-center items-center font-rubik-400">
      <div className="flex flex-col items-center scale-90 sm:scale-125 transition-all duration-300 md:scale-150">
        <h3 className="text-lg">Not Found</h3>
        <h1 className="text-9xl font-rubik-800 text-emerald-600 p-0 m-0">404</h1>
        <h3 className="text-base text-red-500">Could not find requested resource</h3>
        <Link href="/restaurant/dashboard" className='text-white text-sm bg-emerald-600 hover:bg-emerald-500 hover:cursor-pointer mt-2 px-2 py-1 rounded-sm'>Return Home</Link>
      </div>
    </main>
  )
}
