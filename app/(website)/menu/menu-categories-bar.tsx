"use client";

import React, { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { MenuCategoryWithItemCount } from "@/lib/definations";
import { swrFetcher } from "@/lib/swr";
import { slugify } from "@/lib/utils";

const CategoriesBar: React.FC = (): React.JSX.Element => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { data: categories, error, isLoading } = useSWR<MenuCategoryWithItemCount[]>(
        "/api/categories",
        swrFetcher
    );

    const currentCategory = searchParams.get("category") || "all";

    const handleTagClick = useCallback(
        (name: string | null) => {
            const params = new URLSearchParams(searchParams.toString());

            if (!name || name.toLowerCase() === "all") {
                params.delete("category");
            } else {
                params.set("category", slugify(name));
            }

            const queryString = params.toString();
            router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
        },
        [router, pathname, searchParams]
    );

    if (isLoading) return <p>Loading...</p>;
    if (error) {
        console.error(error);
        return <p>Error</p>;
    }

    return (
        <div className="mb-8 overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-max lg:justify-center">
                {/* "All" button */}
                <button
                    onClick={() => handleTagClick("all")}
                    className={`
            px-6 py-3 rounded-xl font-medium transition-all duration-300 
            whitespace-nowrap flex items-center gap-2
            ${currentCategory === "all"
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                            : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-800 border border-neutral-700/50"
                        }
          `}
                >
                    All
                </button>

                {categories?.map((category) => {
                    const isSelected = currentCategory === slugify(category.category);

                    return (
                        <button
                            key={category.id}
                            onClick={() => handleTagClick(category.category)}
                            className={`
                px-6 py-3 rounded-xl font-medium transition-all duration-300 
                whitespace-nowrap flex items-center gap-2
                ${isSelected
                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                                    : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-800 border border-neutral-700/50"
                                }
              `}
                        >
                            {category.category}
                            <Badge
                                variant="secondary"
                                className={`
                  ${isSelected
                                        ? "bg-emerald-500 text-white"
                                        : "bg-neutral-700 text-neutral-300"
                                    }
                `}
                            >
                                {category.total_items}
                            </Badge>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoriesBar;