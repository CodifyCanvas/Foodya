'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, User } from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { logo, WebsiteNavLinks } from "@/constants";

import gsap from "gsap";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname } from "next/navigation";



export default function Navbar() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = useState(false);
    const path = usePathname();
    const isMobile = useIsMobile()

    // Refs for animation targets
    const logoRef = useRef<HTMLDivElement | null>(null);
    const navRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Logo animation — slide in from left with fade + blur
        if (logoRef.current?.children) {
            tl.fromTo(
                logoRef.current.children,
                {
                    opacity: 0,
                    scale: 0.5,
                    filter: "blur(6px)",
                },
                {
                    opacity: 1,
                    filter: "blur(0px)",
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    delay: 0.2,
                },
                0
            );
        }

        // Navigation links — fade up with gentle spring-like motion
        if (navRef.current?.children) {
            tl.fromTo(
                Array.from(navRef.current.children),
                {
                    y: 20,
                    opacity: 0,
                    filter: "blur(8px) drop-shadow(0 0 8px rgba(16,185,129,0.8))",
                },
                {
                    y: 0,
                    opacity: 1,
                    filter: "blur(0px) drop-shadow(0 0 0px rgba(16,185,129,0))",
                    duration: 0.6,
                    stagger: 0.15,
                },
                "<0.2"
            );
        }

        // CTA Button — pop in with scale + glow
        if (buttonRef.current) {
            tl.fromTo(
                buttonRef.current,
                {
                    scale: 0.5,
                    opacity: 0,
                    boxShadow: "0px 0px 0px rgba(99,241,102,0)",
                },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.6,
                    ease: "back.out(1.7)",
                    boxShadow: "0px 0px 25px rgba(99,241,102, .40)",
                    delay: isMobile ? 0.1 : 1.2, // 🕒 Wait for nav links only on desktop
                },
                "<" // relative position keeps timeline sync but respects delay
            );
        }
    }, []);


    useEffect(() => {
        function handleScroll() {
            if (window.scrollY > 20) {
                if (!scrolled) setScrolled(true);
                if (containerRef.current) {
                    gsap.to(containerRef.current, {
                        duration: 0.5,
                        backgroundColor: "rgba(0, 0, 0, 0.10)", // bg-white/5
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)", // shadow-lg
                        borderColor: "rgba(255, 255, 255, 0.2)", // border-white/20
                        marginTop: '20px',
                        borderRadius: "1rem", // rounded-xl
                        ease: "power3.out",
                    });
                }
            } else {
                if (scrolled) setScrolled(false);
                if (containerRef.current) {
                    gsap.to(containerRef.current, {
                        duration: 0.5,
                        backgroundColor: "transparent",
                        boxShadow: "none",
                        borderColor: "transparent",
                        marginTop: "0px",
                        borderRadius: "0",
                        ease: "power3.out",
                    });
                }
            }
        }

        window.addEventListener("scroll", handleScroll);

        // Cleanup listener
        return () => window.removeEventListener("scroll", handleScroll);
    }, [scrolled]);

    return (
        <header className="fixed top-0 z-50 w-full px-5 border-none">
            <div
                ref={containerRef}
                className={`container backdrop-blur-md mx-auto flex items-center justify-between px-4 py-3 border transition-none`}
                style={{
                    borderColor: "transparent",
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    marginTop: 0,
                    borderRadius: 0,
                }}
            >
                {/* Logo */}
                <div ref={logoRef}>
                    <Link href="/" className="text-lg flex items-center gap-2 font-bold text-white">
                        <Image
                            src={logo.main}
                            alt="NexBot Logo"
                            width={48}
                            height={48}
                            className="w-8 h-8 object-contain rounded"
                            priority
                        />
                        Foodya
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav
                    ref={navRef}
                    className="absolute left-1/2 -translate-x-1/2 hidden md:flex gap-12 font-semibold"
                >
                    {WebsiteNavLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="relative text-md font-medium text-white/90 transition duration-300 group  text-nowrap"
                        >
                            {link.label}
                            {/* underline */}
                            <span
                                className="absolute left-1/2 bottom-0 block h-0.5 w-0 bg-emerald-500 
                   transition-all duration-500 transform -translate-x-1/2 
                   group-hover:w-2/3 origin-center"
                            />
                        </Link>
                    ))}
                </nav>


                {/* Right Side (Button + Mobile Menu) */}
                <div className="flex items-center gap-2">
                    {/* Desktop Button */}
                    <Link href='/login'>
                        <Button
                            ref={buttonRef}
                            className="cursor-pointer bg-gradient-to-b from-emerald-400 to-emerald-600 px-6 py-2 font-sans border-[1px] border-emerald-800 text-white shadow-[0px_4px_32px_0_rgba(99,241,102, .50)]  font-medium group"
                        >
                            <User />
                            <span className="md:block hidden">Login</span>
                        </Button>
                    </Link>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>

                            <SheetContent
                                side="right"
                                className="bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 backdrop-blur-2xl border-none outline-none"
                            >
                                <SheetHeader className="sr-only">
                                    <SheetTitle>Navbar</SheetTitle>
                                    <SheetDescription>Mobile navigation menu</SheetDescription>
                                </SheetHeader>

                                <nav className="px-6 py-8 space-y-2">
                                    {WebsiteNavLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`block px-6 py-4 text-lg font-medium rounded-xl transition-all duration-300 transform translate-x-0 opacity-100 ${path === link.href
                                                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30'
                                                : 'text-white/70 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                {link.label}
                                                {path === link.href && (
                                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}