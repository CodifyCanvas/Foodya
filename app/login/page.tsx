import { LoginForm } from "@/components/login-form"
import Image from "next/image"
import { logo } from "@/constants"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Login | Foodya Restaurant POS System - Secure Access to Your Dashboard',
  description: 'Access your Foodya Restaurant POS account securely. Log in to manage orders, billing, inventory, and staff operations with ease.',
  icons: {
    icon: `${logo.favicon}`,
  },
};


export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className=" text-sidebar-primary-foreground flex aspect-square size-12 items-center justify-center rounded-lg">
            <Image src={logo.main}
              alt="logo"
              width={120}
              height={120}
              className="w-full h-full object-contain rounded-md" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium font-rubik-500 text-xl">Foodya</span>
            <span className="truncate text-xs font-rubik-400">Find it, Eat it, Love it</span>
          </div>
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
