"use client";

import React, { useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { MenuCategoryWithItemCount } from "@/lib/definations";
import { swrFetcher } from "@/lib/swr";
import { slugify } from "@/lib/utils";
import { SkeletonCategoriesBar } from "@/components/fallbacks/skeletons";



/** === Types === */
interface TagButtonProps {
    category: MenuCategoryWithItemCount;
    isSelected: boolean;
    onClick: () => void;
}



/** === Tag Button Component === */
const TagButton: React.FC<TagButtonProps> = ({ category, isSelected, onClick }) => {
    return (
        <Button
            onClick={onClick}
            className={`
              px-3 py-2.5 sm:px-6 sm:py-5 rounded-md font-medium flex items-center gap-2 whitespace-nowrap
              transition-all duration-300
              ${isSelected
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                    : "bg-white/10 cursor-pointer backdrop-blur-2xl text-white hover:bg-white/15 border border-neutral-700/50"}
            `}
        >
            {category.category}

            <Badge
                variant="secondary"
                className={`${isSelected
                    ? "bg-emerald-500/75 text-white shadow-md"
                    : "bg-white/15 text-neutral-300"
                    }`}
            >
                {category.total_items}
            </Badge>
        </Button>
    );
};



/** === Main Category Bar Component === */
const CategoriesBar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const scrollRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const { data: categories, error, isLoading } = useSWR<MenuCategoryWithItemCount[]>(
        "/api/categories",
        swrFetcher,
        { revalidateOnFocus: false, revalidateIfStale: false }
    );

    const currentCategory = searchParams.get("category") || "all";

    /** === Handle Tag Click === */
    const handleTagClick = useCallback(
        (name: string | null) => {
            const params = new URLSearchParams(searchParams.toString());

            if (!name || name.toLowerCase() === "all") params.delete("category");
            else params.set("category", slugify(name));

            const query = params.toString();
            router.push(`${pathname}${query ? `?${query}` : ""}`);
        },
        [router, pathname, searchParams]
    );

    /** === Drag Scrolling === */
    const onMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;

        isDragging.current = true;
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft.current = scrollRef.current.scrollLeft;
    };

    const stopDragging = () => {
        isDragging.current = false;
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollRef.current) return;

        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 1.5;
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };

    /** === Loading + Error State === */
    if (isLoading) return <SkeletonCategoriesBar />;
    if (error) return <p>Error loading categories.</p>;

    return (
        <div className="relative select-none">
            {/* Left gradient */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-black/20 to-transparent z-10" />

            {/* Right gradient */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-black/20 to-transparent z-10" />

            {/* Scrollable Menu */}
            <div
                ref={scrollRef}
                className="overflow-x-auto scrollbar-hidden px-10 py-2 cursor-grab active:cursor-grabbing mb-4"
                onMouseDown={onMouseDown}
                onMouseUp={stopDragging}
                onMouseLeave={stopDragging}
                onMouseMove={onMouseMove}
            >
                <div className="flex gap-3 min-w-max lg:justify-center">
                    {/* All Button */}
                    <Button
                        onClick={() => handleTagClick("all")}
                        className={`px-3 py-2.5 sm:px-6 sm:py-5 rounded-md font-medium flex items-center whitespace-nowrap transition-all duration-300 font-rubik
                          ${currentCategory === "all"
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                                : "bg-white/10 backdrop-blur-2xl cursor-pointer text-white hover:bg-white/20 border border-neutral-700/50"}
                        `}
                    >
                        All
                    </Button>

                    {/* Category Buttons */}
                    {categories?.map((c) => (
                        <TagButton
                            key={c.id}
                            category={c}
                            isSelected={currentCategory === slugify(c.category)}
                            onClick={() => handleTagClick(c.category)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoriesBar;