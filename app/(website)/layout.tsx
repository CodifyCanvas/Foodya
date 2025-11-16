// @/app/restaurant/layout.tsx

import React from "react";
import { Metadata } from "next";
import { logo } from "@/constants";
import Navbar from "@/components/custom/Landing-page/components/Navbar";
import Footer from "@/components/custom/Landing-page/components/Footer";

/* === Metadata Configuration === */
export const metadata: Metadata = {
    title: "Foodya - Cloud-Based Restaurant POS System",
    description:
        "Foodya is a modern, cloud-powered restaurant POS system designed to simplify operations. Manage orders, billing, invoices, employees, tables, and inventory with an intuitive dashboard built for restaurants, cafés, and food businesses of all sizes.",
    keywords: [
        "Foodya",
        "restaurant pos system",
        "cloud pos",
        "restaurant billing software",
        "inventory management",
        "order management system",
        "restaurant invoice system",
        "employee management",
        "POS for restaurants",
        "cafe POS",
        "food business software"
    ],
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