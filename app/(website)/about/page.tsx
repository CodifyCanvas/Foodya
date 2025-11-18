"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Next.js 13+ hooks
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AboutMe from "./about-me";
import AboutProject from "./about-project";

const tabs = [
    { name: 'About Project', value: 'about-project', content: <AboutProject /> },
    { name: 'About Me', value: 'about-me', content: <AboutMe /> },
];

export default function AboutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(tabParam || "about-project");

    // === Update active tab if URL param changes (back/forward browser navigation) ===
    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // === Update URL when tab changes ===
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", value);
        router.replace(url.toString(), { scroll: false });
    };

    return (
        <section
            id="about"
            className="mt-20 sm:scroll-mt-[100px] w-full min-h-[calc(100vh-60px)] flex flex-col items-center text-center text-white px-5 py-12"
        >
            <div className='w-full container'>
                <Tabs value={activeTab} onValueChange={handleTabChange} className='gap-4 p-0 w-full items-center'>
                    <TabsList className='bg-transparent gap-1 border border-white/20 px-1 py-5 rounded-full'>
                        {tabs.map(tab => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className='data-[state=active]:bg-emerald-500 dark:data-[state=active]:bg-emerald-500 text-white/75 data-[state=active]:text-white dark:data-[state=active]:text-white dark:data-[state=active]:border-transparent text-lg p-4 rounded-full'
                            >
                                {tab.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {tabs.map(tab => (
                        <TabsContent key={tab.value} value={tab.value}>
                            {tab.content}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </section>
    );
}