"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import CategoriesBar from "./menu-categories-bar";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { swrFetcher } from "@/lib/swr";
import { MenuResponse } from "@/lib/definations";
import Masonry from "react-masonry-css";
import { MenuItemSkeleton } from "@/components/fallbacks/skeletons";
import MenuItemCard from "./menu-item-card";
import { getVisiblePages } from "@/lib/utils";

const MenuItemContainer: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    /** === URL Values (Source of Truth) === */
    const initialSearch = searchParams.get("search") || "";
    const initialPage = Number(searchParams.get("page") || 1);
    const initialLimit = Number(searchParams.get("limit") || 16);
    const initialCategory = searchParams.get("category") || "";

    /** === Local State for Input Typing === */
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [page, setPage] = useState(initialPage);

    /** === Debounce updating URL (ONLY URL triggers SWR) === */
    useEffect(() => {
        const handler = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());

            // Search
            if (!searchTerm) params.delete("search");
            else params.set("search", searchTerm);

            // Page
            if (page === 1) params.delete("page");
            else params.set("page", page.toString());

            router.push(`${pathname}?${params.toString()}`);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, page]);

    /** === Create URL For API Using URL Params Only === */
    const apiUrl = `/api/menu?${new URLSearchParams({
        search: initialSearch || "",
        page: initialPage.toString(),
        limit: initialLimit.toString(),
        category: initialCategory || "",
    })}`;

    /** === Fetch Data === */
    const { data, error, isLoading, isValidating } = useSWR<MenuResponse>(
        apiUrl,
        swrFetcher,
        {
            keepPreviousData: true,
        }
    );

    /** === Page Change === */
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    /** === Error Screen === */
    if (error) {
        console.error("[MenuItemPage] SWR Error:", error);
        return (
            <main className="w-full h-full flex flex-1 bg-gradient-to-tr from-white/5 to-white/10 backdrop-blur-2xl rounded-lg justify-center items-center font-rubik-400">
                <div className="flex flex-col items-center scale-90 sm:scale-125 transition-all duration-300 md:scale-150">
                    <h3 className="text-lg text-white">Service Unavailable</h3>
                    <h3 className="text-lg text-red-500">Please try again later.</h3>
                </div>
            </main>
        );
    }

    return (
        <div className="relative">
            {/* Categories */}
            <CategoriesBar />

            {/* Search Input */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />

                    <Input
                        type="text"
                        placeholder="Search for dishes, ingredients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-10 h-12 bg-neutral-800/50 border-neutral-700/50 text-white placeholder:text-neutral-400 focus:border-emerald-600 focus:ring-emerald-600/20"
                    />

                    {searchTerm && (
                        <Button
                            variant="ghost"
                            onClick={() => setSearchTerm("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-neutral-700"
                        >
                            <X className="w-4 h-4 text-neutral-400" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Record Count */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-neutral-400">
                    Showing{" "}
                    <span className="text-white font-semibold">
                        {data?.totalRecords || 0} items
                    </span>
                </p>
            </div>

            {/* Skeleton (Only first load) */}
            {!data && isLoading ? (
                <MenuItemSkeleton count={12} />
            ) : (
                <>
                    {/* Small indicator (optional) */}
                    {isValidating && (
                        <p className="text-neutral-400 mb-4 text-sm">
                            Updating results...
                        </p>
                    )}

                    {/* Masonry Grid */}
                    <Masonry
                        breakpointCols={{
                            default: 4,
                            1540: 3,
                            1030: 2,
                            770: 1,
                        }}
                        className="flex w-full gap-8 pt-8 px-4"
                        columnClassName="flex flex-col gap-16"
                    >
                        {data?.menuItems?.map((item) => (
                            <div key={item.id} className="w-[17rem] mx-auto">
                                <MenuItemCard data={item} />
                            </div>
                        ))}
                    </Masonry>
                </>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    <Button variant="outline" disabled={page === 1} onClick={() => handlePageChange(page - 1)} title="Previous Page" className="inline-flex items-center justify-center w-10 p-3 bg-white/5 hover:bg-emerald-600 group rounded-full hover:w-20 cursor-pointer transition-all duration-300 overflow-hidden">
                        <span className="relative flex items-center transition-all duration-300">
                            <ArrowLeft className="text-white transition-all duration-300 group-hover:-translate-x-1" />
                            <span className="absolute left-[4px] h-[2px] w-0 bg-white rounded-full transition-all duration-300 group-hover:w-3"></span>
                        </span>
                    </Button>

                    {getVisiblePages(page, data.totalPages).map((p, index) => {
                        // Ellipsis
                        if (p === "...") {
                            return (
                                <div
                                    key={`ellipsis-${index}`}
                                    className="flex justify-center items-center w-10 text-neutral-500 select-none"
                                >
                                    ...
                                </div>
                            );
                        }

                        // Normal Page Button
                        return (
                            <Button
                                key={p}
                                onClick={() => handlePageChange(Number(p))}
                                variant={p === page ? "default" : "outline"}
                                className={`inline-flex items-center justify-center w-10 p-3 ${p === page ? "bg-emerald-500 border-none" : "bg-neutral-900"
                                    } group rounded-full hover:w-20 cursor-pointer transition-all duration-300 overflow-hidden`}
                            >
                                {p}
                            </Button>
                        );
                    })}

                    <Button variant="outline" disabled={page === data.totalPages} onClick={() => handlePageChange(page + 1)} title="Next Page" className="inline-flex items-center justify-center w-10 p-3 bg-white/5 group rounded-full hover:w-20 cursor-pointer transition-all duration-300 overflow-hidden">
                        <span className="relative flex items-center transition-all duration-300">
                            <ArrowRight className="text-white transition-all duration-300 group-hover:translate-x-1" />
                            <span className="absolute right-[4px] h-[2px] w-0 bg-white rounded-full transition-all duration-300 group-hover:w-3"></span>
                        </span>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MenuItemContainer;