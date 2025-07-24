// hooks/useDbStatus.ts
"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";

type DbError = {
    message: string;
    status: number;
};

const fetcher = async (url: string) => {
    const res = await fetch(url);

    if (!res.ok) {
        // Throw custom error with both message and status
        const errorData: DbError = {
            message: "Database Connection failed",
            status: res.status,
        };
        throw errorData;
    }

    return res.json();
};

export function useDbCheck() {
    const router = useRouter();

    const { error } = useSWR("/api/db-health", fetcher, {
        revalidateOnFocus: false,
        refreshInterval: 0,
    });

    if (error) {
        // Ensure we handle both status and message
        const msg = encodeURIComponent(error.message || "Unknown error");
        const status = error.status || 500;
        router.push(`/errors/database?msg=${msg}&status=${status}`);
    }
}
