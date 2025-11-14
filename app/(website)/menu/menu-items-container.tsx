"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import CategoriesBar from "./menu-categories-bar";
import MenuItemCard from "./menu-item-card";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { swrFetcher } from "@/lib/swr";
import { MenuResponse } from "@/lib/definations";
import Masonry from 'react-masonry-css'

const MenuItemContainer: React.FC = (): React.JSX.Element => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // URL params
    const initialSearch = searchParams.get("search") || "";
    const initialPage = Number(searchParams.get("page") || 1);
    const initialLimit = Number(searchParams.get("limit") || 16);
    const initialCategory = searchParams.get("category") || "";

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [page, setPage] = useState(initialPage);

    // Build API URL based on current params
    const apiUrl = `/api/menu?${new URLSearchParams({
        search: searchTerm || "",
        page: page.toString(),
        limit: initialLimit.toString(),
        category: initialCategory || "",
    }).toString()}`;

    const { data, error, isLoading } = useSWR<MenuResponse>(apiUrl, swrFetcher);

    // Debounce searchTerm and update URL
    useEffect(() => {
        const handler = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());

            if (!searchTerm) {
                params.delete("search");
            } else {
                params.set("search", searchTerm);
            }

            // Remove page if it's 1
            if (page === 1) {
                params.delete("page");
            } else {
                params.set("page", page.toString());
            }

            router.push(`${pathname}?${params.toString()}`);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm, page, router, pathname, searchParams]);


    // Handle page change
    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());

        if (newPage === 1) {
            params.delete("page");
        } else {
            params.set("page", newPage.toString());
        }

        router.push(`${pathname}?${params.toString()}`);
        setPage(newPage);
    };


    return (
        <div className="relative">
            {/* Category Tabs */}
            <CategoriesBar />

            {/* Search Bar */}
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
                            className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-neutral-700 transition-colors"
                        >
                            <X className="w-4 h-4 text-neutral-400" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-neutral-400">
                    Showing <span className="text-white font-semibold">{data?.totalRecords || 0} items</span>
                </p>
            </div>

            {/* Menu Items Grid */}
            {isLoading ? <MenuItemSkeleton count={16} /> : (
                <Masonry
                    breakpointCols={{
                        default: 4,  // <- xl
                        1200: 3,     // <- lg
                        900: 2,      // <- md
                        500: 1,      // <- sm
                    }}
                    className="flex w-full gap-8 pt-8 px-4"
                    columnClassName="flex flex-col gap-16"
                >
                    {data?.menuItems?.map((item) => (
                        <div key={item.id} className="w-[17rem] mx-auto">
                            <MenuItemCard data={item} />
                        </div>
                    ))}
                </Masonry>)}


            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    <Button
                        disabled={page === 1}
                        onClick={() => handlePageChange(page - 1)}
                    >
                        Previous
                    </Button>
                    {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                            key={p}
                            variant={p === page ? "default" : "outline"}
                            onClick={() => handlePageChange(p)}
                        >
                            {p}
                        </Button>
                    ))}
                    <Button
                        disabled={page === data.totalPages}
                        onClick={() => handlePageChange(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MenuItemContainer;



const MenuItemSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => {
    return (
        <Masonry
            breakpointCols={{
                default: 4,
                1200: 3,
                900: 2,
                500: 1,
            }}
            className="flex w-full gap-8 pt-8 px-4"
            columnClassName="flex flex-col gap-16"
        >
            {Array.from({ length: count }).map((_, i) => {
                // Generate random height between 28rem (448px) and 40rem (640px)
                const randomHeight = Math.floor(Math.random() * (250 - 50 + 1)) + 300;

                return (
                    <div
                        key={i}
                        className="w-[17rem] mx-auto rounded-lg bg-white/10 backdrop-blur-2xl animate-pulse"
                        style={{ height: `${randomHeight}px` }}
                    />
                );
            })}
        </Masonry>
    );
};