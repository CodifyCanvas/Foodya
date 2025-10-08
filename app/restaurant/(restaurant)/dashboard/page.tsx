// app/(dashboard)/dashboard/page.tsx
import { auth } from '@/auth'
import React from 'react'

const Dashboard = async () => {
  const session = await auth()
  const user = session?.user

  if (!user?.id) {
    return (
      <main className="flex items-center justify-center h-[75vh] bg-white rounded-lg">
        <p className="text-red-500 text-sm">User session not found.</p>
      </main>
    )
  }

  return (
    <main className="w-full h-full bg-white rounded-lg px-6 py-8 flex flex-col justify-center items-center min-h-[75vh]">
      <div className="w-full max-w-md text-center space-y-4">
        <h1 className="text-3xl font-semibold text-emerald-600">Dashboard Page</h1>
      </div>
    </main>
  )
}

export default Dashboard
