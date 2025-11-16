// hooks/useDbStatus.ts
"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";



/**
 * === Represents a custom error returned when DB connection fails. ===
 */
type DbError = {
    error: string;
    status: number;
};



/**
 * === Fetcher function for SWR to check DB health endpoint. ===
 * 
 * @param {string} url - The API endpoint to check.
 * @returns - Resolves if the response is OK, else throws a custom error.
 * 
 * @throws {DbError} - Custom error with status and message when fetch fails.
 */
const fetcher = async (url: string) => {
    const res = await fetch(url);

    if (!res.ok) {
        // Throw custom error with both message and status
        const errorData: DbError = {
            error: "Database Connection failed",
            status: res.status,
        };
        throw errorData;
    }

    return res.json();
};



/**
 * === React hook to monitor the database connection status using SWR. ===
 *
 * - Automatically redirects to a custom error page if the DB is unreachable.
 * - Disables revalidation on focus and background refresh.
 *
 * @returns {void}
 */
export function useDbCheck(): void {
    const router = useRouter();

    const { error } = useSWR("/api/db-health", fetcher, {
        revalidateOnFocus: false,
        refreshInterval: 0,
    });

    if (error) {
        // Ensure we handle both status and message
        const msg = encodeURIComponent(error.error || "Unknown error");
        const status = error.status || 503;

        router.push(`/errors/database?msg=${msg}&status=${status}`);
    }
}
