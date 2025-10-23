import React from 'react';
import { Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import QuickAction from './quick-action';

const DashboardPage = async () => {

  // === Get user session ===
  const session = await auth();
  const currentUser = session?.user;

  // === Redirect if no user session found ===
  if (!currentUser) {
    toast.error("Please log in to continue.");
    redirect('/login');
  }

  // === Get current hour and year for greetings and footer ===
  const hour = new Date().getHours();
  const year = new Date().getFullYear();

  // === Function to return greeting based on current time ===
  const getGreeting = () => {
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <main className="w-full h-full py-5 px-3 flex flex-1 transition-all duration-300 bg-white rounded-lg justify-center items-center font-rubik-400">
      <div className="mx-auto">

        {/* === Hero Welcome Section === */}
        <div className="text-center mb-16 space-y-6">

          {/* === Animated Icon === */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl sm:rounded-3xl shadow-xl">
              <Utensils className="size-12 transition-all duration-300 sm:w-20 sm:h-20 text-white" />
            </div>
          </div>

          {/* === Greeting Badge and Welcome Text === */}
          <div className="space-y-3">
            <Badge
              variant="secondary"
              className="text-xs py-1.5 sm:text-sm sm:py-1 px-2 rounded-full gap-2 bg-emerald-100/75 transition-all duration-300 text-emerald-600 hover:bg-emerald-100"
            >
              <div className="relative flex justify-center items-center p-2">
                <div className="w-3 h-3 absolute z-20 bg-green-500 rounded-full duration-500 animate-ping"></div>
                <div className="w-2 h-2 absolute z-10 bg-green-500 rounded-full"></div>
              </div>
              {getGreeting()}
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl transition-all duration-300 font-rubik-500 text-gray-900 tracking-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Foodya
              </span>
            </h1>

            <p className="text-2xl font-rubik-400 text-gray-600 font-medium">
              Hello, <span className="text-emerald-600">{currentUser.name}</span>!
            </p>

            <p className="text-sm sm:text-base md:text-lg transition-all duration-300 font-rubik-400 text-gray-500 max-w-2xl mx-auto">
              Your all-in-one platform for managing your food business with excellence
            </p>
          </div>
        </div>

        {/* === Quick Access Menu Cards === */}
        <QuickAction />

        {/* === Status Footer === */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-xs sm:text-sm transition-all duration-300 text-gray-400">
            Logged in as{' '}
            <span className="capitalize hover:underline">{currentUser.role_name}</span> • Foodya Dashboard v1.0
          </p>

          <div className="flex items-center justify-center gap-2 text-sm sm:text-base transition-all duration-300 text-gray-500">
            <span>© {year} Foodya - All Rights Reserved</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
