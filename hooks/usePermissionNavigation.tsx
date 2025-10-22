// hooks/usePermissionNavigation.ts

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TriangleAlert } from "lucide-react";
import { useUserContext } from "@/hooks/context/useUserContext";
import { getLastPathSegment } from "@/lib/utils";
import React from "react";



/**
 * === Custom React hook to handle navigation with permission checks. ===
 * 
 * This hook extracts the target module from a given URL, verifies if the user
 * has 'can_view' permission for that module, and conditionally navigates or
 * displays a toast error if permission is denied.
 *
 * It uses user permissions from `useUserContext` and Next.js router for navigation.
 *
 * @example
 * const { handleNavigation } = usePermissionNavigation();
 * 
 * Usage in event handler
 * handleNavigation('/dashboard/settings');
 */
export function usePermissionNavigation() {
    const router = useRouter();

    // === User's permissions context ===
    const { permission } = useUserContext();

    /**
     * Function to handle navigation with permission checks.
     * - Extracts last path segment (module name) from the given URL.
     * - Checks if the user has 'can_view' permission for that module.
     * - If allowed, navigates to the URL using router.push.
     * - Otherwise, shows a toast notification about insufficient permissions.
     */
    const handleNavigation = React.useCallback(
        (url: string) => {

            // === Extract the last segment of the URL path (e.g., 'settings' from '/dashboard/settings') ===
            const lastSegment = getLastPathSegment(url);

            // === Check if user has 'can_view' permission for this module ===
            if (permission?.[lastSegment]?.can_view) {
                router.push(url);
            } else {
                toast.custom(
                    <div className="flex items-center gap-3 bg-red-500 text-white px-5 py-3 rounded-lg shadow-lg">
                        <TriangleAlert className="w-5 h-5 text-white" />
                        <span>You don&apos;t have permission.</span>
                    </div>,
                    {
                        position: "top-right",
                        duration: 4000,
                    }
                );
            }
        },
        // === Dependencies for the callback to avoid stale closures ===
        [permission, router]
    );

    return { handleNavigation };
}