// app/layout.tsx (server component, no 'use client')
import { Geist_Mono, Rubik } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { logo } from "@/constants";
import { Metadata } from "next";
import { ThemeProvider } from "@/components/ui/theme-provider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rubik',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Foodya Restaurant POS System | Smart Restaurant Management Software',
  description: 'Foodya is a powerful cloud-based restaurant POS system designed to simplify order management, billing, inventory tracking, and staff operations. Streamline your restaurant business with an all-in-one POS solution.',
  icons: {
    icon: `${logo.favicon}`,
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={` ${geistMono.variable} ${rubik.variable} antialiased`}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}