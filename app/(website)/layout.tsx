// @/app/restaurant/layout.tsx

import React from "react";
import { Metadata } from "next";
import { logo } from "@/constants";
import Navbar from "@/components/custom/Landing-page/components/Navbar";
import Footer from "@/components/custom/Landing-page/components/Footer";

/* === Metadata Configuration === */
export const metadata: Metadata = {
    title:
        "Foodya Restaurant POS System",
    description:
        "Foodya is an all-in-one cloud-based restaurant POS system offering powerful features including order management, invoicing, employee tracking, inventory control, and billing. Streamline your restaurant operations with our intuitive dashboard and comprehensive tools.",
    icons: {
        icon: logo.favicon,
    },
};

/* === Main Application Layout === */
export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <main
            className="flex flex-col items-center min-h-screen max-w-screen font-sans
  bg-gradient-to-tl from-neutral-950 to-[#001529] text-white"
        >
            <Navbar />
            {children}
            <Footer />
        </main>

    );
}