"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import TransactionTitleCell from "@/components/custom/dialogs/transaction-title-cell";
import { TransactionsReportResult } from "@/lib/definations";
import { formatDateWithFns } from "@/lib/date-fns";
import { toCapitalizedWords } from "@/lib/utils";
import { swrFetcher } from "@/lib/swr";
import { useSidebar } from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";



// === Debounce hook to limit fast state changes ===
const useDebouncedValue = (input: string, delay: number): string => {
    const [debounced, setDebounced] = useState(input);

    useEffect(() => {
        const timeout = setTimeout(() => setDebounced(input), delay);
        return () => clearTimeout(timeout);
    }, [input, delay]);

    return debounced;
};



export function TransactionTable() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { open } = useSidebar();

    // === Get Initial States from URL ===
    const defaultSearch = searchParams.get("search") ?? "";
    const defaultLimit = parseInt(searchParams.get("limit") || "10", 10);
    const defaultPage = parseInt(searchParams.get("page") || "1", 10);

    // === Local States ===
    const [searchText, setSearchText] = useState(defaultSearch);
    const [rowsPerPage, setRowsPerPage] = useState(defaultLimit);
    const [currentPage, setCurrentPage] = useState(defaultPage);

    const debouncedSearch = useDebouncedValue(searchText, 500);

    // === Update URL params when filters change ===
    useEffect(() => {
        const params = new URLSearchParams();

        if (debouncedSearch) params.set("search", debouncedSearch);
        if (rowsPerPage !== 10) params.set("limit", rowsPerPage.toString());
        if (currentPage !== 1) params.set("page", currentPage.toString());

        router.push(`?${params.toString()}`, { scroll: false });
    }, [debouncedSearch, rowsPerPage, currentPage, router]);

    // === Construct API URL ===
    const endpoint = useMemo(() => {
        return `/api/reports/transactions?page=${currentPage}&limit=${rowsPerPage}&search=${debouncedSearch}`;
    }, [currentPage, rowsPerPage, debouncedSearch]);

    // === Data fetching using SWR ===
    const { data, error, isLoading } = useSWR<TransactionsReportResult>(endpoint, swrFetcher);

    // === Fallback Values ===
    const transactions = data?.transactions ?? [];
    const totalPages = data?.totalPages ?? 1;

    // === Pagination Handlers ===
    const handlePrevious = useCallback(() => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    }, []);

    const handleNext = useCallback(() => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    }, [totalPages]);

    // === Handle Change for Rows Per Page ===
    const handleLimitChange = useCallback((value: string) => {
        setRowsPerPage(Number(value));
        setCurrentPage(1);  // <- Reset to first page
    }, []);

    // === Handle Search Change ===
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setCurrentPage(1);  // <- Reset to first page
    }, []);

    if (error) return <div className="text-red-500">Failed to load transactions.</div>;

    return (
        <div className={`space-y-4 pt-5 ${open ? 'md:w-[calc(100vw-23rem)]' : 'md:w-[calc(100vw-8rem)]'}`}>
            {/* === Header === */}
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-medium pt-3 text-emerald-600 text-start">Transactions</h2>
            </div>

            {/* === Search and Filters === */}
            <div className="flex items-center gap-2 justify-between">
                <Input
                    type="search"
                    variant="minimal"
                    placeholder="Search transactions..."
                    value={searchText}
                    onChange={handleSearchChange}
                    className="max-w-sm"
                />
                <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">Rows per page:</span>
                    <Select value={rowsPerPage.toString()} onValueChange={handleLimitChange}>
                        <SelectTrigger className="w-20 h-8 rounded-lg font-rubik">
                            <SelectValue placeholder="Rows" />
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 10, 15, 20, 30, 40, 50].map((count) => (
                                <SelectItem key={count} className="font-rubik-400" value={count.toString()}>
                                    {count}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* === Transaction Table === */}
            <div className="overflow-x-auto">
                <Table className="min-w-full">
                    <TableCaption>{searchText ? `Search Result of '${searchText}'` : `List of all transactions`}</TableCaption>
                    <TableHeader>
                        <TableRow className="uppercase text-xs">
                            <TableHead>TID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-center">Category</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Type</TableHead>
                            <TableHead className="text-center">Source</TableHead>
                            <TableHead className="text-center">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading
                            ? (
                                [...Array(10)].map((_, index) => (
                                    <TableRow key={`skeleton-${index}`}>
                                        {Array(8).fill(0).map((_, cellIdx) => (
                                            <TableCell key={cellIdx}>
                                                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : transactions.map((txn) => (
                                <TableRow key={txn.id}>
                                    <TableCell>{txn.id}</TableCell>
                                    <TableCell><TransactionTitleCell row={txn} /></TableCell>
                                    <TableCell className="text-muted-foreground">{txn.description ?? "-"}</TableCell>
                                    <TableCell className="text-muted-foreground text-center capitalize">{txn.category ?? "-"}</TableCell>
                                    <TableCell className="font-medium text-right">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div>{txn.amount ? `${txn.amount.toLocaleString()} PKR` : '-'}</div>
                                            </TooltipTrigger>
                                            {txn.amount &&
                                                <TooltipContent className="text-sm max-w-xs text-center">
                                                    <p>{toCapitalizedWords(txn.amount)}</p>
                                                </TooltipContent>}
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell className="text-center capitalize">
                                        {txn.type === "credit" ? (
                                            <Badge className="rounded-full border-none min-w-16 bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-400">
                                                <span className="size-1.5 rounded-full inline-block bg-emerald-600 dark:bg-emerald-400" />
                                                {txn.type}
                                            </Badge>
                                        ) : (
                                            <Badge className="rounded-full border-none min-w-16 bg-red-200 text-red-700 dark:bg-red-400/10 dark:text-red-400">
                                                <span className="size-1.5 rounded-full inline-block bg-red-600 dark:bg-red-400" />
                                                {txn.type}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center capitalize"><Badge variant="outline">{txn.sourceType}</Badge></TableCell>
                                    <TableCell className="text-right">{formatDateWithFns(txn.createdAt, { showTime: true, showSeconds: true, })}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            {/* === Pagination Controls === */}
            <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</div>
                <div className="flex space-x-2">

                    <Button variant="outline" size="icon" title="Go to previous page" className="size-8" onClick={handlePrevious} disabled={currentPage === 1}  >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft />
                    </Button>
                    <Button variant="outline" size="icon" title="Go to next page" className="size-8" onClick={handleNext} disabled={currentPage === totalPages} >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight />
                    </Button>

                </div>
            </div>
        </div>
    );
}