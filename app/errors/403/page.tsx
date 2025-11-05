// app/errors/403/page.tsx
import React from 'react'

export default function AccessDenied() {
  return (
    <main className="w-full h-full flex flex-1 bg-card outline outline-border rounded-lg justify-center items-center font-rubik-400">
      <div className="flex flex-col items-center scale-90 sm:scale-125 transition-all duration-300 md:scale-150">
        <h3 className="text-lg text-foreground">Forbidden</h3>
        <h1 className="text-9xl font-rubik-800 text-primary p-0 m-0">403</h1>
        <h3 className="text-lg text-destructive">Access Denied</h3>
      </div>
    </main>
  )
}