"use client";

import React, { useRef, useLayoutEffect, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Check,
    Lightbulb,
    Users,
    BarChart2,
    ShieldCheck,
    Database,
    Smartphone,
    Menu,
    Code2,
    Zap,
    TrendingUp,
    Award,
    Globe,
    Clock,
    Target,
    LucideIcon,
    Code,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HelpLinks, Icons } from "@/constants";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { findItemByKey } from "@/lib/utils";
import Link from "next/link";

// === Register GSAP plugins ===
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}


/** === Stats Section === */
export interface StatInterface {
    icon: LucideIcon;
    value: string;
    suffix: string;
    label: string;
}

/** === Features Section === */
export interface FeatureInterface {
    text: string;
    icon: LucideIcon;
}

/** === Key Features Section === */
export interface KeyFeatureInterface {
    title: string;
    description: string;
    icon: LucideIcon;
    gradient: string;
    iconBg: string;
    borderColor: string;
}

/** === Technologies Section === */
export interface TechnologyInterface {
    name: string;
    color: string;
    category: string;
    icon: string;
}

const AboutProject = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const overviewRef = useRef<HTMLDivElement>(null);
    const missionVisionRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const techStackRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    // Use useLayoutEffect to ensure DOM is ready before animations
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {

            // Header animations - play immediately on load
            const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
                delay: 0.2
            });

            tl.from(badgeRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.6,
            })
                .from(titleRef.current, {
                    opacity: 0,
                    y: 30,
                    duration: 0.8,
                }, "-=0.3")
                .from(descriptionRef.current, {
                    opacity: 0,
                    y: 20,
                    duration: 0.8,
                }, "-=0.5");

            // Stats counter animation 
            if (statsRef.current) {
                const statElements = statsRef.current.querySelectorAll(".stat-card");

                gsap.from(statElements, {
                    scrollTrigger: {
                        trigger: statsRef.current,
                        start: "top 90%",
                        end: "bottom 20%",
                        toggleActions: "play none none none",
                    },
                    opacity: 0,
                    y: 50,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: "power3.out",
                    immediateRender: false,
                });

                // Animate stat values
                statElements.forEach((stat) => {
                    const valueElement = stat.querySelector(".stat-value");
                    if (valueElement) {
                        const endValue = valueElement.textContent || "";

                        gsap.from(valueElement, {
                            scrollTrigger: {
                                trigger: stat,
                                start: "top 90%",
                                toggleActions: "play none none none",
                            },
                            textContent: 0,
                            duration: 2,
                            ease: "power1.out",
                            snap: { textContent: 1 },
                            immediateRender: false,
                            onUpdate: function () {
                                const current = Math.ceil(parseFloat(this.targets()[0].textContent));
                                if (endValue.includes("%")) {
                                    valueElement.textContent = current + "%";
                                } else if (endValue.includes("x")) {
                                    valueElement.textContent = current + "x";
                                } else if (endValue.includes("+")) {
                                    valueElement.textContent = current + "+";
                                } else {
                                    valueElement.textContent = current.toString();
                                }
                            },
                        });
                    }
                });
            }

            // Overview card animation
            if (overviewRef.current) {
                gsap.from(overviewRef.current, {
                    scrollTrigger: {
                        trigger: overviewRef.current,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                    opacity: 0,
                    y: 60,
                    duration: 1,
                    ease: "power3.out",
                    immediateRender: false,
                });

                const featureItems = overviewRef.current.querySelectorAll(".feature-item");
                gsap.from(featureItems, {
                    scrollTrigger: {
                        trigger: overviewRef.current,
                        start: "top 80%",
                        toggleActions: "play none none none",
                    },
                    opacity: 0,
                    x: -30,
                    stagger: 0.1,
                    duration: 0.6,
                    ease: "power2.out",
                    immediateRender: false,
                });
            }

            // Mission & Vision animation
            if (missionVisionRef.current) {
                const cards = missionVisionRef.current.querySelectorAll(".mission-vision-card");
                gsap.from(cards, {
                    scrollTrigger: {
                        trigger: missionVisionRef.current,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                    opacity: 0,
                    y: 50,
                    stagger: 0.2,
                    duration: 0.8,
                    ease: "power3.out",
                    immediateRender: false,
                });
            }

            // Features grid animation 
            if (featuresRef.current) {
                const featureCards = featuresRef.current.querySelectorAll(".feature-card");
                gsap.from(featureCards, {
                    scrollTrigger: {
                        trigger: featuresRef.current,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                    opacity: 0,
                    y: 60,
                    scale: 0.9,
                    stagger: 0.15,
                    duration: 0.7,
                    ease: "back.out(1.2)",
                    immediateRender: false,
                });
            }

            // Tech stack animation 
            if (techStackRef.current) {
                gsap.from(techStackRef.current, {
                    scrollTrigger: {
                        trigger: techStackRef.current,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                    opacity: 0,
                    y: 50,
                    duration: 0.8,
                    ease: "power3.out",
                    immediateRender: false,
                });

                const techItems = techStackRef.current.querySelectorAll(".tech-item");
                if (techItems.length === 0) return;
                gsap.from(techItems, {
                    scrollTrigger: {
                        trigger: techStackRef.current,
                        start: "top 80%",
                        toggleActions: "play none none none",
                    },
                    opacity: 0,
                    scale: 0.8,
                    stagger: 0.05,
                    duration: 0.5,
                    ease: "back.out(1.5)",
                    immediateRender: false,
                });
            }

            // CTA animation 
            if (ctaRef.current) {
                gsap.from(ctaRef.current, {
                    scrollTrigger: {
                        trigger: ctaRef.current,
                        start: "top 90%",
                        toggleActions: "play none none none",
                    },
                    opacity: 0,
                    scale: 0.9,
                    duration: 0.8,
                    ease: "back.out(1.3)",
                    immediateRender: false,
                });
            }

            // Refresh ScrollTrigger after all animations are set
            ScrollTrigger.refresh();
        }, containerRef);

        return () => {
            ctx.revert();
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    const stats: StatInterface[] = [
        { icon: Zap, value: "99.9", suffix: "%", label: "Uptime" },
        { icon: TrendingUp, value: "3", suffix: "x", label: "Faster Operations" },
        { icon: Users, value: "50", suffix: "+", label: "Team Roles" },
        { icon: Award, value: "100", suffix: "%", label: "Secure" },
    ];

    const features: FeatureInterface[] = [
        {
            text: "Seamless order, billing, and kitchen synchronization",
            icon: Check,
        },
        {
            text: "Cloud-based, accessible anywhere in real time",
            icon: Check,
        },
        {
            text: "Built-in analytics for smarter decisions",
            icon: Check,
        },
        {
            text: "Role-based access and high-level data security",
            icon: Check,
        },
        {
            text: "Real-time inventory and stock management",
            icon: Check,
        },
        {
            text: "Multi-branch support with centralized control",
            icon: Check,
        },
    ];

    const keyfeatures: KeyFeatureInterface[] = [
        {
            title: "Smart Operations",
            description:
                "Centralized dashboard connects kitchen, billing, and customer service for real-time efficiency.",
            icon: Menu,
            gradient: "from-emerald-500/20 to-emerald-600/20",
            iconBg: "bg-emerald-500/20",
            borderColor: "border-emerald-500/30",
        },
        {
            title: "Data-Driven Insights",
            description:
                "Visualize sales trends and performance metrics to make informed business decisions.",
            icon: BarChart2,
            gradient: "from-blue-500/20 to-blue-600/20",
            iconBg: "bg-blue-500/20",
            borderColor: "border-blue-500/30",
        },
        {
            title: "Enterprise Security",
            description:
                "Protected by advanced role-based access and secure database management.",
            icon: ShieldCheck,
            gradient: "from-purple-500/20 to-purple-600/20",
            iconBg: "bg-purple-500/20",
            borderColor: "border-purple-500/30",
        },
        {
            title: "Cloud Powered",
            description:
                "Access data securely from anywhere — whether managing one branch or many.",
            icon: Database,
            gradient: "from-green-500/20 to-green-600/20",
            iconBg: "bg-green-500/20",
            borderColor: "border-green-500/30",
        },
        {
            title: "Multi-User System",
            description:
                "Empower teams with roles tailored for admins, chefs, waiters, and managers.",
            icon: Users,
            gradient: "from-orange-500/20 to-orange-600/20",
            iconBg: "bg-orange-500/20",
            borderColor: "border-orange-500/30",
        },
        {
            title: "Mobile Friendly",
            description:
                "Manage operations on the go with an optimized experience for smartphones and tablets.",
            icon: Smartphone,
            gradient: "from-teal-500/20 to-teal-600/20",
            iconBg: "bg-teal-500/20",
            borderColor: "border-teal-500/30",
        },
    ];

    const technologies: TechnologyInterface[] = [
        {
            name: 'React',
            color: 'from-blue-500/20 to-cyan-500/20',
            category: 'Frontend Library',
            icon: Icons.reactjs
        },
        {
            name: 'Auth.js',
            color: 'from-blue-500/20 to-purple-500/20',
            category: 'Authentication',
            icon: Icons.authjs
        },
        {
            name: 'Next.js',
            color: 'from-white/20 to-black/20',
            category: 'Framework',
            icon: Icons.nextjs
        },
        {
            name: 'TypeScript',
            color: 'from-purple-500/20 to-pink-500/20',
            category: 'Programming Language',
            icon: Icons.typescript
        },
        {
            name: 'Tailwind',
            color: 'from-orange-500/20 to-yellow-500/20',
            category: 'CSS Framework',
            icon: Icons.tailwind
        },
        {
            name: 'Drizzle',
            color: 'from-sky-500/20 to-blue-500/20',
            category: 'ORM',
            icon: Icons.drizzleORM
        },
        {
            name: 'MySQL',
            color: 'from-red-500/20 to-rose-500/20',
            category: 'Database',
            icon: Icons.mysql
        },
        {
            name: 'Node.js',
            color: 'from-green-500/20 to-emerald-500/20',
            category: 'Backend Runtime',
            icon: Icons.nodejs
        },
        {
            name: 'Vercel',
            color: 'from-indigo-500/20 to-purple-500/20',
            category: 'Cloud Platform',
            icon: Icons.vercel
        },
        {
            name: 'Github',
            color: 'from-teal-500/20 to-cyan-500/20',
            category: 'Version Control & Hosting',
            icon: Icons.github
        },
        {
            name: 'Shadcn UI',
            color: 'from-violet-500/20 to-purple-500/20',
            category: 'UI Component Library',
            icon: Icons.shadcnUI
        },
        {
            name: 'Html',
            color: 'from-orange-500/20 to-yellow-500/20',
            category: 'Language',
            icon: Icons.html
        },
    ];


    return (
        <div
            ref={containerRef}
            className="w-full mx-auto flex flex-col items-center gap-12 sm:gap-16 md:gap-20 lg:gap-24 py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        >

            {/* === Header Section === */}
            <Header ref={headerRef} badgeRef={badgeRef} titleRef={titleRef} descriptionRef={descriptionRef} />

            {/* === Stats Section === */}
            <StatCards ref={statsRef} stats={stats} />


            {/* === Overview Card  === */}
            <OverviewCard ref={overviewRef} features={features} />

            {/* === Mission & Vision Cards === */}
            <MissionVision ref={missionVisionRef} />

            {/* === Key Features Grid  === */}
            <KeyFeatureCards ref={featuresRef} keyFeatures={keyfeatures} />

            {/* === Tech Stack Section - Redesigned === */}
            <TechStack ref={techStackRef} technologies={technologies} />


            {/* === CTA Section === */}
            <Cta />


        </div >
    );
};

export default AboutProject;



// === Header Component with Badge, Title, and Description ===
const Header = forwardRef<
    HTMLDivElement,
    React.DetailedHTMLProps<React.HTMLProps<HTMLDivElement>, HTMLDivElement> & {
        badgeRef?: React.RefObject<HTMLDivElement | null>;
        titleRef?: React.RefObject<HTMLHeadingElement | null>;
        descriptionRef?: React.RefObject<HTMLParagraphElement | null>;
    }
>(({ badgeRef, titleRef, descriptionRef, ...props }, ref) => {

    return (
        <div ref={ref} {...props} className="text-center space-y-4 sm:space-y-6 max-w-4xl mx-auto w-full px-4">
            <div ref={badgeRef} className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-2 sm:mb-4">
                <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                <span className="text-xs sm:text-sm text-emerald-400 font-medium">
                    Next-Gen Restaurant Solution
                </span>
            </div>

            <h1 ref={titleRef} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-200 to-white px-4">
                About Foodya
            </h1>

            <p ref={descriptionRef} className="text-neutral-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto px-4">
                Transforming restaurant management with intelligent automation, real-time insights, and seamless operations — empowering your business to thrive in the digital age.
            </p>
        </div>
    );
});
Header.displayName = 'About Project - Header';



// === Stat Cards Component ===
const StatCards = forwardRef<HTMLDivElement, { stats: StatInterface[] }>(
    ({ stats, ...props }, ref) => {

        return (
            <div
                ref={ref} {...props}
                className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl px-4"
            >
                {stats.map((stat, i) => (
                    <Card
                        key={i}
                        className="stat-card h-full relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group overflow-hidden"
                    >
                        {/* Left Accent Bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 via-teal-400 to-emerald-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>

                        {/* Top Gradient Line */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-700"></div>

                        {/* Content */}
                        <div className="relative z-10 flex items-center flex-1 gap-4 sm:gap-5">
                            {/* Icon Section */}
                            <div className="flex-shrink-0">
                                <div className="relative">
                                    {/* Glow Effect */}
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    {/* Icon Container */}
                                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-emerald-500/20 group-hover:border-emerald-400/40">
                                        {stat.icon && <stat.icon className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />}
                                    </div>
                                </div>
                            </div>

                            {/* Text Section */}
                            <div className="flex-1 text-left">
                                {/* Value */}
                                <div className="stat-value text-3xl sm:text-4xl font-bold mb-1">
                                    <span className="bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                                        {stat.value}
                                    </span>
                                    <span className="text-emerald-400 ml-0.5">{stat.suffix}</span>
                                </div>

                                {/* Label */}
                                <div className="text-xs sm:text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors font-medium">
                                    {stat.label}
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
                                </div>
                            </div>
                        </div>

                        {/* Corner Decoration */}
                        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tl-full"></div>
                    </Card>
                ))}
            </div>
        );
    }
);
StatCards.displayName = 'About Project - Stat Cards';



// === Overview Card Component ===
const OverviewCard = forwardRef<HTMLDivElement, { features: FeatureInterface[] }>(
    ({ features, ...props }, ref) => {

        return (
            <Card
                ref={ref}
                {...props}
                className="relative overflow-hidden w-full max-w-6xl rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-2xl p-6 sm:p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/10 group"
            >
                {/* ========== Ambient Glow Layers ========== */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-emerald-500/5 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute -bottom-16 -right-16 w-56 h-56 md:w-80 md:h-80 bg-emerald-500/10 rounded-full blur-[100px] group-hover:opacity-80 transition-opacity duration-700"></div>

                {/* ========== Top Gradient Line Accent ========== */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

                {/* ========== Left Gradient Accent Bar ========== */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald-500 via-teal-400 to-emerald-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-top"></div>

                {/* ========== Inner Content ========== */}
                <CardContent className="relative z-10 space-y-8 sm:space-y-10 text-left">
                    {/* ---- Heading & Description ---- */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-1 h-7 sm:h-8 bg-gradient-to-b from-emerald-500 via-teal-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-emerald-50 to-emerald-200 bg-clip-text text-transparent">
                                What is <span className="text-emerald-400">Foodya</span>?
                            </h3>
                        </div>

                        <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-4xl pl-[1.2rem] sm:pl-[1.75rem]">
                            <span className="text-emerald-400 font-semibold">Foodya</span> is a modern{" "}
                            <span className="font-semibold text-white">
                                Cloud-Native Restaurant Management System
                            </span>{" "}
                            engineered to unify operations — bridging kitchen, billing, analytics, and customer
                            service into one dynamic ecosystem. It empowers businesses to operate with precision,
                            efficiency, and real-time insight.
                        </p>
                    </div>

                    {/* ---- Feature Grid ---- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pl-[1.2rem] sm:pl-[1.75rem]">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="feature-item relative flex items-start gap-3 sm:gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-500 group/item border border-white/[0.05] hover:border-emerald-500/20"
                            >
                                {/* Animated Emerald Icon Glow */}
                                <div className="relative flex-shrink-0">
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-md blur-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative text-emerald-400 mt-0.5 group-hover/item:scale-110 transition-transform duration-500">
                                        {feature.icon && <feature.icon className="w-5 h-5" />}
                                    </div>
                                </div>

                                {/* Feature Text */}
                                <span className="text-neutral-300 text-sm sm:text-base leading-relaxed group-hover/item:text-white transition-colors duration-500">
                                    {feature.text}
                                </span>

                                {/* Subtle Side Line Animation */}
                                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald-500 via-teal-400 to-emerald-500 scale-y-0 group-hover/item:scale-y-100 transition-transform duration-700 origin-top"></div>
                            </div>
                        ))}
                    </div>

                    {/* ---- Bottom Accent Line ---- */}
                    <div className="mt-6 sm:mt-8 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                </CardContent>

                {/* ---- Bottom Corner Glow ---- */}
                <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tl from-emerald-500/10 via-teal-500/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </Card>
        );
    }
);
OverviewCard.displayName = 'About Project - Overview Card';



// === Mission & Vision Cards Component ===
const MissionVision = forwardRef<HTMLDivElement, React.DetailedHTMLProps<React.HTMLProps<HTMLDivElement>, HTMLDivElement>>(
    (props, ref) => {

        return (
            <div
                ref={ref}
                {...props}
                className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl px-4"
            >
                {/* Mission Card */}
                <Card className="mission-vision-card relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 p-6 sm:p-8 overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10">
                    {/* Left Accent Bar - Emerald */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald-500 via-emerald-400 to-teal-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-top"></div>

                    {/* Top Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-700"></div>

                    {/* Floating Orb */}
                    <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/15 transition-colors duration-700"></div>

                    <CardContent className="relative z-10 p-0 space-y-5 sm:space-y-6">
                        {/* Icon Container */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {/* Icon Glow Effect */}
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                {/* Icon Box */}
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-emerald-500/20 group-hover:border-emerald-400/40">
                                    <Target className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                                Our Mission
                            </h3>
                        </div>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed group-hover:text-neutral-200 transition-colors">
                            To revolutionize the restaurant industry by providing cutting-edge
                            technology that simplifies operations, enhances customer experiences,
                            and drives sustainable growth for businesses of all sizes.
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
                        </div>
                    </CardContent>

                    {/* Corner Decoration */}
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tl-full"></div>
                </Card>

                {/* Vision Card */}
                <Card className="mission-vision-card relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-teal-500/30 p-6 sm:p-8 overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/10">
                    {/* Left Accent Bar - Teal */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-teal-500 via-teal-400 to-emerald-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-top"></div>

                    {/* Top Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-500/0 group-hover:from-teal-500/5 group-hover:to-emerald-500/5 transition-all duration-700"></div>

                    {/* Floating Orb */}
                    <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-teal-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:bg-teal-500/15 transition-colors duration-700"></div>

                    <CardContent className="relative z-10 p-0 space-y-5 sm:space-y-6">
                        {/* Icon Container */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {/* Icon Glow Effect */}
                                <div className="absolute inset-0 bg-teal-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                {/* Icon Box */}
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-teal-500/20 group-hover:border-teal-400/40">
                                    <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-teal-400 group-hover:text-teal-300 transition-colors" />
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">
                                Our Vision
                            </h3>
                        </div>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed group-hover:text-neutral-200 transition-colors">
                            To become the global standard for restaurant management systems,
                            empowering millions of establishments worldwide with intelligent,
                            cloud-based solutions that adapt to the future of dining.
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
                        </div>
                    </CardContent>

                    {/* Corner Decoration */}
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tl-full"></div>
                </Card>
            </div>
        );
    }
);
MissionVision.displayName = 'About Project - Mission & Vision';



// === Key Features Card Component ===
export const KeyFeatureCards = forwardRef<HTMLDivElement, { keyFeatures: KeyFeatureInterface[] }>(
    ({ keyFeatures, ...props }, ref) => {

        const COLORS = [
            { base: 'emerald', from: 'emerald-500', via: 'emerald-400', to: 'teal-500' },
            { base: 'blue', from: 'blue-500', via: 'blue-400', to: 'blue-600' },
            { base: 'purple', from: 'purple-500', via: 'purple-400', to: 'purple-600' },
            { base: 'green', from: 'green-500', via: 'green-400', to: 'green-600' },
            { base: 'orange', from: 'orange-500', via: 'orange-400', to: 'orange-600' },
        ];

        const getColor = (index: number) => COLORS[index % COLORS.length];

        return (
            <div ref={ref} {...props} className="w-full max-w-6xl space-y-8 sm:space-y-10 px-4">
                {/* Section Header */}
                <div className="text-center space-y-4 sm:space-y-5">
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
                        Powerful Features
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed px-4">
                        Everything you need to run a modern restaurant, unified in one intelligent platform
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                        <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-emerald-500/50"></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-emerald-500/50"></div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
                    {keyFeatures.map((feature, i) => {
                        const color = getColor(i);

                        return (
                            <Card
                                key={i}
                                className="feature-card h-full relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-opacity-30 p-6 sm:p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group overflow-hidden rounded-2xl"
                                style={{ '--hover-border-color': feature.borderColor.replace('border-', '') } as React.CSSProperties}
                            >
                                {/* Left Accent Bar */}
                                <div className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-${color.from} via-${color.via} to-${color.to} scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-top`} />

                                {/* Top Gradient Line */}
                                <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-${color.from}/50`} />

                                {/* Background Glow */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-all duration-700`} />

                                {/* Floating Orb */}
                                <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity duration-700 bg-${color.from}/10 group-hover:bg-${color.from}/15`} />

                                <CardContent className="relative z-10 flex flex-col justify-between items-center flex-1 p-0 space-y-4 sm:space-y-5">
                                    {/* Icon */}
                                    <div className="relative inline-flex">
                                        <div className={`absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-${color.from}/20`}></div>
                                        <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.iconBg.replace('bg-', 'from-')} to-transparent flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-${color.from}/20 group-hover:border-${color.via}/40`}>
                                            {feature.icon && <feature.icon className={`w-6 h-6 text-${color.via} group-hover:text-${color.from}`} />}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h4 className="font-bold text-lg sm:text-xl bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all">
                                        {feature.title}
                                    </h4>

                                    {/* Description */}
                                    <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed group-hover:text-neutral-300 transition-colors">
                                        {feature.description}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="w-full mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full bg-gradient-to-r w-0 group-hover:w-full transition-all duration-1000 ease-out from-${color.base}-500 to-${color.base}-400`} />
                                    </div>

                                </CardContent>

                                {/* Corner Decoration */}
                                <div className={`absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tl-full from-${color.from}/10`}></div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    }
);
KeyFeatureCards.displayName = 'About Project - Key Feature Cards';



// === Tech Stack Card Component ===
const TechStack = forwardRef<HTMLDivElement, { technologies: TechnologyInterface[] }>(
    ({ technologies, ...props }, ref) => {
        const colors = [
            { base: 'blue', gradient: 'from-blue-500 via-blue-400 to-cyan-500' },
            { base: 'emerald', gradient: 'from-emerald-500 via-emerald-400 to-teal-500' },
            { base: 'purple', gradient: 'from-purple-500 via-purple-400 to-pink-500' },
            { base: 'orange', gradient: 'from-orange-500 via-orange-400 to-yellow-500' },
            { base: 'sky', gradient: 'from-sky-500 via-sky-400 to-blue-500' },
            { base: 'red', gradient: 'from-red-500 via-red-400 to-rose-500' },
            { base: 'green', gradient: 'from-green-500 via-green-400 to-emerald-500' },
            { base: 'indigo', gradient: 'from-indigo-500 via-indigo-400 to-purple-500' },
            { base: 'teal', gradient: 'from-teal-500 via-teal-400 to-cyan-500' },
            { base: 'violet', gradient: 'from-violet-500 via-violet-400 to-purple-500' },
        ];

        const getColor = (index: number) => colors[index % colors.length];

        const stats = [
            { label: 'Technologies', value: `${technologies.length}+`, color: 'from-emerald-500 to-teal-500' },
            { label: 'Performance', value: '99.9%', color: 'from-blue-500 to-cyan-500' },
            { label: 'Uptime', value: '24/7', color: 'from-purple-500 to-pink-500' },
            { label: 'Support', value: 'Active', color: 'from-orange-500 to-yellow-500' },
        ];

        return (
            <div ref={ref} {...props} className="w-full max-w-6xl space-y-8 sm:space-y-10 px-4">
                {/* Section Header */}
                <div className="text-center space-y-4 sm:space-y-5">
                    <div className="inline-flex items-center justify-center gap-3 mb-2">
                        <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-emerald-500/50"></div>
                        <Code2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
                        <div className="w-8 h-[2px] bg-gradient-to-l from-transparent to-emerald-500/50"></div>
                    </div>

                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
                        Built With Modern Technologies
                    </h3>

                    <p className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed px-4">
                        Powered by cutting-edge tools and frameworks for blazing-fast performance and infinite scalability
                    </p>

                    <div className="flex items-center justify-center gap-2 pt-2">
                        <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-emerald-500/50"></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-emerald-500/50"></div>
                    </div>
                </div>

                {/* Technologies Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                    {technologies.map((tech, i) => {
                        const color = getColor(i);
                        return (
                            <Card
                                key={i}
                                className="tech-card h-full relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-opacity-30 p-5 sm:p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group overflow-hidden rounded-2xl"
                            >
                                {/* Accent bar */}
                                <div
                                    className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b ${color.gradient} scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-top`}
                                ></div>

                                {/* Top line */}
                                <div
                                    className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-${color.base}-500/50`}
                                ></div>

                                {/* Background Glow */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-100 transition-all duration-700`}></div>

                                {/* Floating Orb */}
                                <div
                                    className={`absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-${color.base}-500/20`}
                                ></div>

                                <CardContent className="relative z-10 flex flex-col justify-between items-center flex-1 space-y-3 sm:space-y-4 p-0">
                                    {/* Icon */}
                                    <div className="relative inline-flex w-full justify-center">
                                        <div
                                            className={`absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-${color.base}-500/30`}
                                        ></div>

                                        <div
                                            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${tech.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 border border-${color.base}-500/30 group-hover:border-${color.base}-400/50`}
                                        >
                                            {tech.icon ? (
                                                <Image
                                                    src={tech.icon}
                                                    alt={tech.name}
                                                    width={40}
                                                    height={40}
                                                    className="text-2xl sm:text-3xl font-bold text-white/90"
                                                />
                                            ) : (
                                                <Code className="w-7 h-7" />
                                            )}
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-base sm:text-lg text-center bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all">
                                        {tech.name}
                                    </h4>

                                    <div className="flex justify-center">
                                        <span
                                            className={`text-[10px] sm:text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-${color.base}-400 group-hover:border-white/30 transition-colors`}
                                        >
                                            {tech.category || 'Latest'}
                                        </span>
                                    </div>

                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r w-0 group-hover:w-full transition-all duration-1000 ease-out from-${color.base}-500 to-${color.base}-400`}
                                        ></div>
                                    </div>
                                </CardContent>

                                <div
                                    className={`absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tl-full from-${color.base}-500/10`}
                                ></div>

                                {/* Particle Effect */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    <div className="absolute w-1 h-1 bg-white/50 rounded-full top-1/4 left-1/4 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                                    <div className="absolute w-1 h-1 bg-white/50 rounded-full top-3/4 right-1/4 opacity-0 group-hover:opacity-100 group-hover:animate-ping animation-delay-150"></div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="relative group p-4 sm:p-5 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                            ></div>
                            <div className="relative z-10 text-center space-y-1">
                                <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                    {stat.value}
                                </div>
                                <div className="text-xs sm:text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">
                                    {stat.label}
                                </div>
                            </div>
                            <div
                                className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);
TechStack.displayName = 'About Project - Tech Stack Cards';



// === Cta Section Component ===
const Cta: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => {

    const githubLink = findItemByKey(HelpLinks, "title", "Github");

    return (
        <div {...props} className="w-full flex flex-col gap-4">
            <div className="block inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

            {/* Top icon + sparkle */}
            <div className="relative z-10 mx-auto -mt-3 sm:mt-4 mb-2 sm:mb-4 inline-flex">
                <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-xl opacity-60 animate-pulse"></div>
                <div className="relative inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-300 shadow-[0_0_40px_-15px_rgba(16,185,129,0.6)]">
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
            </div>

            <CardContent className="relative z-10 space-y-5 sm:space-y-6 p-0">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs sm:text-sm text-neutral-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                    Launch in days, not months
                </div>

                {/* Headline */}
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
                        Ready to Transform Your Restaurant?
                    </span>
                </h3>

                {/* Subheadline */}
                <p className="mx-auto max-w-2xl text-sm sm:text-base text-neutral-300">
                    Join hundreds of restaurants using Foodya to streamline operations, boost revenue,
                    and deliver a world-class guest experience all from one intelligent platform.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link href={githubLink?.href ?? '#'}>
                        <Button
                            type="button"
                            className="group relative inline-flex items-center rounded-md justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-base font-semibold text-white shadow-[0_10px_25px_-10px_rgba(16,185,129,0.6)] transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.7)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                        >
                            Start free trial
                            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M13 5l7 7-7 7" />
                            </svg>
                        </Button>
                    </Link>

                    <Link href={githubLink?.href ?? '#'}>
                        <Button
                            type="button"
                            className="group relative inline-flex rounded-md items-center justify-center gap-2 border border-white/15 bg-white/5 px-5 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                        >
                            Book a demo
                            <svg className="h-4 w-4 opacity-80 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M13 5l7 7-7 7" />
                            </svg>
                        </Button>
                    </Link>
                </div>


            </CardContent>

            <div className="block inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

            {/* Proof */}
            <div className="pt-1">
                <p className="text-xs text-neutral-400">
                    Trusted by 500+ restaurants
                </p>
            </div>

        </div>
    );
}
Cta.displayName = 'About Project - Cta Section';