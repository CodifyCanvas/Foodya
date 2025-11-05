"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { HeaderMenuCards } from '@/constants';
import { usePermissionNavigation } from '@/hooks/usePermissionNavigation';

const QuickAction = () => {

    // === Get navigation handler from permission hook ===
    const { handleNavigation } = usePermissionNavigation();

    // === Define which quick action cards to display ===
    const visibleCards = ["Orders", "Incomes", "Expenses", "Reports"];

    // === Filter only matching cards from HeaderMenuCards ===
    const quickCards = HeaderMenuCards.filter(card => visibleCards.includes(card.title));

    return (
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {quickCards.map(({ title, icon, href, description }, index) => (
                <li key={index}>
                    {/* === Quick Action Button === */}
                    <Button
                        variant="ghost"
                        onClick={() => handleNavigation(href)}
                        className="flex py-7 cursor-pointer w-full flex-row items-center justify-start gap-3 transition-all duration-200 hover:bg-accent"
                    >
                        {/* === Icon Wrapper === */}
                        <div className="min-w-10 min-h-10 flex items-center justify-center relative overflow-hidden rounded-sm bg-accent transition-all duration-200">
                            <Image
                                src={icon}
                                alt={`${title} icon`}
                                width={120}
                                height={120}
                                className="object-contain absolute w-7 h-7"
                                priority
                            />
                        </div>

                        {/* === Text Content === */}
                        <div className="flex flex-col text-left">
                            <span className="text-sm font-medium font-rubik-500 leading-none text-accent-foreground ">
                                {title}
                            </span>
                            <p className="text-muted-foreground font-rubik-400 text-xs mt-1 leading-snug line-clamp-2">
                                {description}
                            </p>
                        </div>
                    </Button>
                </li>
            ))}
        </ul>
    );
};

export default QuickAction;
