"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AboutMe from "./about-me";
import AboutProject from "./about-project";

const tabs = [
    {
        name: 'About Project',
        value: 'about-project',
        content: <AboutProject />
    },
    {
        name: 'About Me',
        value: 'about-me',
        content: <AboutMe />
    },
]

// === About Page ===
export default function AboutPage() {

    return (
        <section
            id="about"
            className="mt-20 sm:scroll-mt-[100px] w-full min-h-[calc(100vh-60px)] flex flex-col items-center text-center text-white px-5 py-12"
        >
            <div className='w-full container'>
                <Tabs defaultValue='about-project' className='gap-4 p-0 w-full items-center'>
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