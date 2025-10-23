// @/app/restaurant/layout.tsx

import React from "react";
import { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import { DbChecker } from "@/components/custom/Db/db-health-checker";
import ShortcutsHook from "@/components/custom/hookswrapper/shortcuts";
import { MainHeaderMenu } from "@/components/custom/layouts/HeaderMenu";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { logo } from "@/constants";
import { UserProvider } from "@/hooks/context/useUserContext";

/* === Metadata Configuration === */
export const metadata: Metadata = {
  title:
    "Foodya Restaurant POS System | Complete Dashboard, Invoices, Employee & Inventory Management",
  description:
    "Foodya is an all-in-one cloud-based restaurant POS system offering powerful features including order management, invoicing, employee tracking, inventory control, and billing. Streamline your restaurant operations with our intuitive dashboard and comprehensive tools.",
  icons: {
    icon: logo.favicon,
  },
};

/* === Main Application Layout === */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      {/* === Sidebar + Global Context Provider === */}
      <SidebarProvider className="bg-blue-100 font-rubik">

        {/* === Global Hooks & Utilities === */}
        <ShortcutsHook />
        <DbChecker />

        {/* === App Sidebar === */}
        <AppSidebar />

        {/* === Main Layout Container === */}
        <SidebarInset className="flex flex-col gap-4 pl-2 md:pl-0 pr-2">

          {/* === Header Section === */}
          <header className="flex h-16 pt-4 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16">
            <div className="bg-white p-3 px-4 rounded-lg w-full flex items-center gap-2 shadow-sm">
              {/* Sidebar Toggle Button */}
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />

              {/* Header Menu */}
              <div className="w-full flex items-center pt-1 md:pt-0 justify-end md:justify-start">
                <MainHeaderMenu />
              </div>
            </div>
          </header>

          {/* === Page Content Section === */}
          <main className="bg-transparent flex-1 mb-2 font-rubik-400">
            {children}
          </main>

        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}