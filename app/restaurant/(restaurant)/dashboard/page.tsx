import { auth } from '@/auth'
import { redirect } from 'next/navigation';
import React from 'react'
import toast from 'react-hot-toast';

const DashboardPage = async () => {

  const session = await auth();
  const user = session?.user;

  if (!user) {
    toast.error("User session not found.")
    redirect('/login');
  }

  return (
    <main className="w-full h-full bg-white rounded-lg px-6 py-8 flex flex-col justify-center items-center min-h-[75vh]">
      <div className="w-full max-w-md text-center space-y-4">
        <h1 className="text-3xl font-semibold text-emerald-600">Welcome back, {user.name}</h1>
      </div>
    </main>
  )
}

export default DashboardPage