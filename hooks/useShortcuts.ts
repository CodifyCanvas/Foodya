// lib/hooks/useShortcuts.ts
"use client";

import { useEffect } from "react";
import { navLink } from "@/constants";
import { usePermissionNavigation } from "@/hooks/usePermissionNavigation";
import { useTheme } from "next-themes";

export function useShortcuts() {
  const { handleNavigation } = usePermissionNavigation();
  const { theme, setTheme } = useTheme()

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

  // Theme toggle shortcut (Ctrl + Shift + L)
  useEffect(() => {
    const handleThemeShortcut = (e: KeyboardEvent) => {
      // Check for Ctrl + Shift + L
      if (!(e.ctrlKey && e.shiftKey && e.key.toUpperCase() === "L")) return;

      e.preventDefault();
      setTheme(theme === "light" ? "dark" : "light");
    };

    window.addEventListener("keydown", handleThemeShortcut);
    return () => window.removeEventListener("keydown", handleThemeShortcut);
  }, [theme, setTheme]);

}