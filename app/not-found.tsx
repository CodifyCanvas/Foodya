import { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: '404 - Page Not Found | Foodya',
  description: "Oops! The page you're looking for doesn't exist. Explore delicious food and restaurants on Foodya.",
}

export default function NotFound() {
  return (
    <main className="w-[100vw] h-[100vh] flex flex-1 bg-background rounded-lg justify-center items-center font-rubik-400">
      <section className="flex flex-col items-center transition-all duration-300 space-y-6 bg-card w-fit sm:min-w-md md:min-w-lg p-10 rounded-lg outline outline-border">
        <h3 className="text-base sm:text-lg md:text-2xl leading-none">Not Found</h3>
        <h1 className="text-9xl sm:text-[10rem] md:text-[12rem] font-rubik-800 text-primary leading-none m-0 p-0">404</h1>
        <h3 className="text-sm sm:text-base md:text-xl text-destructive leading-none">Could not find requested resource</h3>
        <Link href="/restaurant/dashboard" className="bg-primary/90 text-sm sm:text-base md:text-lg text-white shadow-xs hover:bg-primary/80 hover:cursor-pointer px-4 py-2 rounded-md">
          Return Home
        </Link>
      </section>
    </main>
  )
}
