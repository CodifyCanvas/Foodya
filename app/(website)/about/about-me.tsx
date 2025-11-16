"use client";

import React, { useRef, useLayoutEffect, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Code,
    Lightbulb,
    Users,
    Award,
    Target,
    Star,
    Heart,
    Zap,
    Coffee,
    Monitor,
    Database,
    Smartphone,
    Palette,
    Rocket,
    ArrowRight,
    TrendingUp,
    User,
    Sparkles,
    LucideIcon,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { findItemByKey } from "@/lib/utils";
import { HelpLinks } from "@/constants";

// === Register GSAP plugins ===
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/** === Stats Section === */
export interface Stat {
    icon: LucideIcon;
    value: string;
    suffix: string;
    label: string;
    color: string;
}

/** === Highlight Section === */
export interface Highlight {
    text: string;
    icon: LucideIcon;
}

/** === Skill Section === */
export interface Skill {
    title: string;
    description: string;
    icon: LucideIcon;
    gradient: string;
    iconBg: string;
    progress: number;
}

const AboutMe = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const aboutRef = useRef<HTMLDivElement>(null);
    const journeyRef = useRef<HTMLDivElement>(null);
    const skillsRef = useRef<HTMLDivElement>(null);
    const techStackRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    // Use useLayoutEffect to ensure DOM is ready before animations
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {

            // Hero animations
            if (heroRef.current) {
                const elements = heroRef.current.children; // all direct children

                gsap.from(elements, {
                    opacity: 0,
                    y: 40,
                    stagger: 0.2,   // animate one by one
                    duration: 0.8,
                    ease: "power3.out",
                });
            }

            // Stats counter animation
            if (statsRef.current) {
                const statElements = statsRef.current.querySelectorAll(".stat-card");

                gsap.from(statElements, {
                    scrollTrigger: {
                        trigger: statsRef.current,
                        start: "top 80%",
                        toggleActions: "play none none none",
                    },
                    opacity: 0,
                    y: 60,
                    stagger: 0.2,
                    duration: 0.8,
                    ease: "power3.out",
                    immediateRender: false,
                });

                // Animate stat values
                statElements.forEach((stat, index) => {
                    const valueElement = stat.querySelector(".stat-value");
                    const targetValue = index === 0 ? 50 : index === 1 ? 3 : index === 2 ? 20 : index === 3 ? 5 : 99;

                    gsap.to({ value: 0 }, {
                        value: targetValue,
                        duration: 2,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: stat,
                            start: "top 85%",
                            toggleActions: "play none none none",
                        },
                        onUpdate: function () {
                            const current = Math.floor(this.targets()[0].value);
                            if (valueElement) {
                                if (index === 3) {
                                    valueElement.textContent = current + "%";
                                } else if (index === 4) {
                                    valueElement.textContent = current + "x";
                                } else {
                                    valueElement.textContent = current + "+";
                                }
                            }
                        },
                    });
                });
            }

            // About section animation
            if (aboutRef.current) {

                // Animate the whole about section
                gsap.fromTo(
                    aboutRef.current,
                    { opacity: 0, y: 80 }, // from: invisible and below
                    {
                        opacity: 1,
                        y: 0, // to: visible and in place
                        duration: 1.2,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: aboutRef.current,
                            start: "top 80%",
                            toggleActions: "play none none none",
                        },
                    }
                );

                // Animate each feature item
                const featureItems = aboutRef.current.querySelectorAll(".feature-item");
                if (featureItems.length === 0) return;
                gsap.fromTo(
                    featureItems,
                    { opacity: 0, x: -40 }, // from: invisible and left
                    {
                        opacity: 1,
                        x: 0, // to: visible and in place
                        duration: 0.8,
                        ease: "power2.out",
                        stagger: 0.15, // one by one
                        scrollTrigger: {
                            trigger: aboutRef.current,
                            start: "top 75%",
                            toggleActions: "play none none none",
                        },
                    }
                );
            };

            // Journey cards animation
            if (journeyRef.current) {
                const cards = journeyRef.current.querySelectorAll(".journey-card");

                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 60, scale: 0.9 }, // from (hidden)
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1, // to (visible)
                        stagger: 0.3,
                        duration: 0.8,
                        ease: "back.out(1.2)",
                        scrollTrigger: {
                            trigger: journeyRef.current,
                            start: "top 80%",
                            toggleActions: "play none none none",
                        },
                    }
                );
            }

            // Skills
            if (skillsRef.current) {
                const skillCards = skillsRef.current.querySelectorAll(".skill-card");

                gsap.fromTo(
                    skillCards,
                    { opacity: 0, y: 20, scale: 0.9 }, // start hidden
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1, // end visible
                        stagger: 0.1,
                        duration: 0.6,
                        ease: "back.out(1.4)",
                        scrollTrigger: {
                            trigger: skillsRef.current,
                            start: "top 80%",
                            toggleActions: "play none none none",
                        },
                    }
                );
            }


            // Tech stack animation
            if (techStackRef.current) {
                const techItems = techStackRef.current.querySelectorAll(".tech-item");
                gsap.from(techItems, {
                    scrollTrigger: {
                        trigger: techStackRef.current,
                        start: "top 80%",
                        toggleActions: "play none none none",
                    },
                    opacity: 0,
                    scale: 0.7,
                    stagger: 0.08,
                    duration: 0.6,
                    ease: "back.out(1.6)",
                    immediateRender: false,
                });
            }

            // CTA animation
            if (ctaRef.current) {
                gsap.from(ctaRef.current, {
                    scrollTrigger: {
                        trigger: ctaRef.current,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                    opacity: 0,
                    scale: 0.9,
                    duration: 1,
                    ease: "back.out(1.5)",
                    immediateRender: false,
                });
            }

            ScrollTrigger.refresh();
        }, containerRef);

        return () => {
            ctx.revert();
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    const stats: Stat[] = [
        { icon: Code, value: "10", suffix: "+", label: "Projects Completed", color: "from-blue-500 to-cyan-500" },
        { icon: Coffee, value: "3", suffix: "+", label: "Years Experience", color: "from-orange-500 to-red-500" },
        { icon: Users, value: "10", suffix: "+", label: "Happy Clients", color: "from-green-500 to-emerald-500" },
        { icon: Award, value: "5", suffix: "+", label: "Certifications", color: "from-purple-500 to-pink-500" },
        { icon: TrendingUp, value: "99", suffix: "%", label: "Success Rate", color: "from-teal-500 to-blue-500" },
    ];

    const highlights: Highlight[] = [
        {
            text: "Passionate about creating innovative web solutions that make a difference",
            icon: Heart,
        },
        {
            text: "Full-stack expertise with modern frameworks and best practices",
            icon: Code,
        },
        {
            text: "Focus on clean code, performance, and exceptional user experience",
            icon: Star,
        },
        {
            text: "Continuous learner adapting to latest technologies and trends",
            icon: Zap,
        },
        {
            text: "Problem solver with analytical thinking and creative solutions",
            icon: Target,
        },
        {
            text: "Collaborative team player with strong communication skills",
            icon: Users,
        },
    ];

    const skills: Skill[] = [
        {
            title: "Frontend Development",
            description: "Building responsive, interactive user interfaces with React, Next.js, and modern CSS frameworks.",
            icon: Monitor,
            gradient: "from-blue-500/20 to-blue-600/20",
            iconBg: "bg-blue-500/20",
            progress: 95
        },
        {
            title: "Backend Development",
            description: "Creating robust APIs and server-side applications using Node.js, databases, and cloud services.",
            icon: Database,
            gradient: "from-green-500/20 to-green-600/20",
            iconBg: "bg-green-500/20",
            progress: 88
        },
        {
            title: "UI/UX Design",
            description: "Designing intuitive interfaces and seamless user experiences with modern design principles.",
            icon: Palette,
            gradient: "from-purple-500/20 to-purple-600/20",
            iconBg: "bg-purple-500/20",
            progress: 85
        },
        {
            title: "Mobile Development",
            description: "Developing cross-platform mobile applications using React Native and modern frameworks.",
            icon: Smartphone,
            gradient: "from-orange-500/20 to-orange-600/20",
            iconBg: "bg-orange-500/20",
            progress: 80
        },
        {
            title: "Cloud & DevOps",
            description: "Implementing scalable solutions with AWS, Docker, CI/CD pipelines, and modern deployment strategies.",
            icon: Rocket,
            gradient: "from-teal-500/20 to-teal-600/20",
            iconBg: "bg-teal-500/20",
            progress: 82
        },
        {
            title: "Problem Solving",
            description: "Analytical thinking to break down complex challenges into elegant, maintainable solutions.",
            icon: Lightbulb,
            gradient: "from-yellow-500/20 to-yellow-600/20",
            iconBg: "bg-yellow-500/20",
            progress: 92
        },
    ];

    return (
        <div
            ref={containerRef}
            className="w-full mx-auto flex flex-col items-center gap-16 sm:gap-20 md:gap-24 lg:gap-28 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        >

            {/* === Header Section === */}
            <Header ref={heroRef} />

            {/* === Stats Section === */}
            <StatsCard ref={statsRef} stats={stats ?? []} />

            {/* === About Section === */}
            <About ref={aboutRef} highlights={highlights ?? []} />

            {/* === Vision Section === */}
            <Vision ref={journeyRef} />

            {/* === Skills Section === */}
            <Skills ref={skillsRef} skills={skills ?? []} />

        </div>
    );
};

export default AboutMe;



// === Header Section Component ===
const Header = forwardRef<HTMLDivElement, React.DetailedHTMLProps<React.HTMLProps<HTMLDivElement>, HTMLDivElement>>(
    (props, ref) => {

        const githubLink = findItemByKey(HelpLinks, "title", "Github");

        return (
            <div ref={ref} {...props} className="w-full max-w-6xl text-center space-y-8">
                {/* Status Badge */}
                <Badge
                    variant="secondary"
                    className="text-xs py-1.5 sm:text-sm sm:py-1 px-2 rounded-full gap-2 bg-emerald-600/30 transition-all duration-300 text-emerald-400"
                >
                    <div className="relative flex justify-center items-center p-2">
                        <div className="w-3 h-3 absolute z-20 bg-green-500 rounded-full duration-500 animate-ping"></div>
                        <div className="w-2 h-2 absolute z-10 bg-green-500 rounded-full"></div>
                    </div>
                    Available for opportunities
                </Badge>

                {/* Main Title */}
                <div className="hero-title space-y-4">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                        <span className="block bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                            Shahzaib Awan
                        </span>
                        <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-neutral-300 mt-2">
                            Full Stack Developer
                        </span>
                    </h1>
                </div>

                {/* Subtitle */}
                <p className="hero-subtitle mx-auto max-w-3xl text-lg sm:text-xl text-neutral-300 leading-relaxed">
                    I craft digital experiences that bridge the gap between innovative design and robust functionality.
                    With a passion for clean code and user-centric solutions, I transform complex challenges into elegant,
                    scalable applications.
                </p>

                {/* CTA Buttons */}
                <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Link href={githubLink?.href || '#'} target="_blank" rel="noopener noreferrer">
                        <Button className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60">
                            View My Work
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }
);
Header.displayName = 'Header';



// === Stats Card Component ===
const StatsCard = forwardRef<HTMLDivElement, { stats: Stat[] }>(
    (props, ref) => {
        return (
            <div
                ref={ref}
                {...props}
                className="w-full max-w-6xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6"
            >
                {props.stats.map((stat, i: number) => (
                    <Card
                        key={i}
                        className="stat-card relative bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group overflow-hidden"
                    >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-all duration-500`}></div>

                        {/* Content */}
                        <div className="relative z-10 text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors duration-300">
                                {stat.icon && <stat.icon className="w-6 h-6 text-white" />}
                            </div>

                            <div className="space-y-1">
                                <div className={`stat-value text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                    {stat.value}{stat.suffix}
                                </div>
                                <div className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Accent Line */}
                        <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                    </Card>
                ))}
            </div>
        );
    }
);
StatsCard.displayName = 'Stats Card';



// === About Section Component ===
const About = forwardRef<HTMLDivElement, { highlights: Highlight[] }>(
    (props, ref) => {
        return (
            <div ref={ref} {...props} className="w-full opacity-0 max-w-7xl space-y-16">
                {/* Section Header */}
                <div className="text-center space-y-6">
                    <div className="inline-block">
                        <div className="flex items-center gap-3 mb-4 justify-center">
                            <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-500"></div>
                            <span className="text-sm font-medium text-blue-400 tracking-wider uppercase">Get to know me</span>
                            <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-500"></div>
                        </div>
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                        <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                            About Me
                        </span>
                    </h2>
                    <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
                        Crafting digital experiences with passion, precision, and purpose
                    </p>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 font-rubik-400">
                    {/* Profile Card - Spans 4 columns */}
                    <Card className="md:col-span-4 relative overflow-hidden bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-500 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                        <CardContent className="relative z-10 p-8 flex flex-col items-center text-center space-y-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                                <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-white/20 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                    <User className="w-16 h-16 text-blue-300" />
                                    {/* Replace with: <img src="/profile.jpg" alt="Profile" className="w-full h-full object-cover" /> */}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white">Full-Stack Developer</h3>
                                <p className="text-neutral-400 text-sm">Building the future, one line at a time</p>
                            </div>

                            {/* Stats */}
                            <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">3+</div>
                                    <div className="text-xs text-neutral-400 uppercase tracking-wide">Years Exp</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">21</div>
                                    <div className="text-xs text-neutral-400 uppercase tracking-wide">Age</div>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                <span className="text-xs text-emerald-300 font-medium">Available for opportunities</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Journey Card - Spans 8 columns */}
                    <Card className="md:col-span-8 relative overflow-hidden bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <CardContent className="relative z-10 p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                                    <Sparkles className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">My Journey</h3>
                            </div>

                            <div className="space-y-4 text-neutral-300 leading-relaxed">
                                <p>
                                    At <span className="text-white font-semibold">21</span>, I&apos;ve already spent <span className="text-white font-semibold">3+ years</span> diving deep into the world of full-stack development. What started as curiosity about how websites work has evolved into a passion for creating digital experiences that truly matter.
                                </p>
                                <p>
                                    I believe in writing <span className="text-emerald-400">clean, maintainable code</span> and staying current with the latest technologies and best practices. Every project is an opportunity to learn, grow, and push the boundaries of what&apos;s possible on the web.
                                </p>
                            </div>

                            {/* Timeline Pills */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                {['Problem Solver', 'Team Player', 'Quick Learner', 'Detail-Oriented'].map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-neutral-300 hover:border-purple-500/30 hover:text-white transition-all duration-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Highlights Cards - Each spans 6 columns on md, creating 2x3 grid */}
                    {props.highlights.map((highlight, i) => (
                        <Card
                            key={i}
                            className="md:col-span-6 lg:col-span-4 relative overflow-hidden bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-emerald-500/50 transition-all duration-500 group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>

                            <CardContent className="relative z-10 p-6 space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        <div className="text-emerald-400">
                                            {highlight.icon && <highlight.icon className="w-5 h-5" />}
                                        </div>
                                    </div>
                                    <p className="text-sm text-neutral-300 leading-relaxed group-hover:text-white transition-colors duration-300 flex-1">
                                        {highlight.text}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
);
About.displayName = 'About Me';



// === Mission & Vision Card Component ===
const Vision = forwardRef<HTMLDivElement, React.DetailedHTMLProps<React.HTMLProps<HTMLDivElement>, HTMLDivElement>>(
    (props, ref) => {
        return (
            <div ref={ref} {...props} className="w-full max-w-7xl space-y-16">
                {/* Section Header */}
                <div className="text-center space-y-6">
                    <div className="inline-block">
                        <div className="flex items-center gap-3 mb-4 justify-center">
                            <div className="h-px w-8 bg-gradient-to-r from-transparent to-emerald-500"></div>
                            <span className="text-sm font-medium text-emerald-400 tracking-wider uppercase">Where I&apos;m Heading</span>
                            <div className="h-px w-8 bg-gradient-to-l from-transparent to-emerald-500"></div>
                        </div>
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                        <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
                            Mission & Vision
                        </span>
                    </h2>
                </div>

                {/* Mission & Vision Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Mission Card */}
                    <Card className="journey-card h-full relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-emerald-500/50 transition-all duration-500 group overflow-hidden">
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-emerald-500/10 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                        {/* Decorative Elements */}
                        <div className="absolute top-8 right-8 w-20 h-20 border border-emerald-500/10 rounded-full group-hover:scale-150 group-hover:rotate-90 transition-all duration-700"></div>
                        <div className="absolute bottom-8 left-8 w-16 h-16 border border-emerald-500/10 rounded-lg group-hover:scale-150 group-hover:rotate-45 transition-all duration-700"></div>

                        <CardContent className="relative z-10 p-10 space-y-8 flex flex-col justify-between flex-1">
                            {/* Header */}
                            <div className="space-y-4">
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-emerald-500/30 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 border border-emerald-500/30">
                                        <Target className="w-8 h-8 text-emerald-400" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                                        Mission
                                    </h3>
                                    <div className="h-1 w-16 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full mt-2"></div>
                                </div>
                            </div>

                            {/* Content */}
                            <p className="text-neutral-300 leading-relaxed text-lg">
                                To create innovative web solutions that not only meet technical requirements but also provide exceptional user experiences. I strive to bridge the gap between complex functionality and intuitive design.
                            </p>

                            {/* Key Points */}
                            <div className="space-y-3">
                                {['Innovation First', 'User-Centric Design', 'Technical Excellence'].map((point, i) => (
                                    <div key={i} className="flex items-center gap-3 group/item">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover/item:scale-150 transition-transform duration-300"></div>
                                        <span className="text-sm text-neutral-400 group-hover/item:text-emerald-300 transition-colors duration-300">{point}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vision Card */}
                    <Card className="journey-card relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 group overflow-hidden">
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/0 via-purple-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                        {/* Decorative Elements */}
                        <div className="absolute top-8 right-8 w-20 h-20 border border-purple-500/10 rounded-full group-hover:scale-150 group-hover:-rotate-90 transition-all duration-700"></div>
                        <div className="absolute bottom-8 left-8 w-16 h-16 border border-purple-500/10 rounded-lg group-hover:scale-150 group-hover:-rotate-45 transition-all duration-700"></div>

                        <CardContent className="relative z-10 p-10 space-y-8 flex flex-col justify-between flex-1">
                            {/* Header */}
                            <div className="space-y-4">
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-purple-500/30 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 border border-purple-500/30">
                                        <Rocket className="w-8 h-8 text-purple-400" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                                        Vision
                                    </h3>
                                    <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-blue-400 rounded-full mt-2"></div>
                                </div>
                            </div>

                            {/* Content */}
                            <p className="text-neutral-300 leading-relaxed text-lg">
                                To become a leading developer who contributes to open-source projects, mentors others, and builds applications that make a positive impact on people&apos;s lives through technology.
                            </p>

                            {/* Key Points */}
                            <div className="space-y-3">
                                {['Open Source Contributor', 'Community Mentor', 'Impact-Driven Builder'].map((point, i) => (
                                    <div key={i} className="flex items-center gap-3 group/item">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 group-hover/item:scale-150 transition-transform duration-300"></div>
                                        <span className="text-sm text-neutral-400 group-hover/item:text-purple-300 transition-colors duration-300">{point}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 via-blue-400 to-purple-500 w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Values Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Innovation', value: '100%', color: 'from-blue-500 to-cyan-500' },
                        { label: 'Quality', value: '100%', color: 'from-purple-500 to-pink-500' },
                        { label: 'Growth', value: '100%', color: 'from-emerald-500 to-teal-500' },
                        { label: 'Impact', value: '100%', color: 'from-orange-500 to-red-500' },
                    ].map((value, i) => (
                        <Card
                            key={i}
                            className="relative overflow-hidden bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all duration-500 group"
                        >
                            <CardContent className="p-6 text-center space-y-3">
                                <div className={`text-3xl font-bold bg-gradient-to-r ${value.color} bg-clip-text text-transparent`}>
                                    {value.value}
                                </div>
                                <div className="text-sm text-neutral-400 uppercase tracking-wider">{value.label}</div>
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r ${value.color} w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-1000`}></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
);
Vision.displayName = 'Vision - About Me';


// === Skills Card Component ===
const Skills = forwardRef<HTMLDivElement, { skills: Skill[] }>(
    (props, ref) => {
        return (
            <div
                ref={ref}
                className="w-full max-w-6xl space-y-12"
            >
                {/* Section Header */}
                <div className="text-center space-y-4">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
                        Core Competencies
                    </h2>
                    <p className="text-neutral-400 max-w-2xl mx-auto">
                        Comprehensive skill set spanning the entire development lifecycle
                    </p>

                    {/* Decorative divider */}
                    <div className="flex items-center justify-center gap-3 pt-4">
                        <div className="w-16 h-[2px] bg-gradient-to-r from-transparent to-blue-500/50"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <div className="w-16 h-[2px] bg-gradient-to-l from-transparent to-blue-500/50"></div>
                    </div>
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {props.skills.map((skill, i) => (
                        <Card
                            key={i}
                            className="skill-card relative bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group overflow-hidden flex flex-col h-full"
                        >
                            {/* Background Effects */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${skill.gradient} opacity-0 group-hover:opacity-100 transition-all duration-700`}></div>
                            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-white/10 to-transparent"></div>

                            <CardContent className="relative z-10 flex flex-col justify-between flex-1 p-0 space-y-4">
                                {/* Top Content */}
                                <div className="space-y-4">
                                    {/* Icon & Title */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/20">
                                                {skill.icon && <skill.icon className="w-6 h-6 text-white" />}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">
                                            {skill.title}
                                        </h3>
                                    </div>

                                    {/* Description */}
                                    <p className="text-neutral-400 text-sm leading-relaxed group-hover:text-neutral-300 transition-colors">
                                        {skill.description}
                                    </p>
                                </div>

                                {/* Progress Bar at the bottom */}
                                <div className="space-y-2 mt-4">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-neutral-400">Proficiency</span>
                                        <span className="text-white font-medium">{skill.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 ease-out origin-left"
                                            style={{ width: `${skill.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
);
Skills.displayName = 'Skill - About Me';