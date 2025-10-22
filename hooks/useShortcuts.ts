// lib/hooks/useShortcuts.ts
"use client";

import { useEffect } from "react";
import { navLink } from "@/constants";
import { usePermissionNavigation } from "@/hooks/usePermissionNavigation";

export function useShortcuts() {
  const { handleNavigation } = usePermissionNavigation();

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!e.altKey) return;

      const key = e.key.toUpperCase();

      // Flatten only the nav items that have children and shortcuts
      const flatItems = navLink
        .filter((item) => typeof item === "object" && "items" in item && Array.isArray(item.items))
        .flatMap((item: any) => item.items)
        .filter((item) => Array.isArray(item.shortcuts));

      for (const item of flatItems) {
        const [mod, shortcutKey] = item.shortcuts;
        if (mod === "Alt" && shortcutKey.toUpperCase() === key) {
          e.preventDefault();
          handleNavigation(item.url);
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handleNavigation]);
}