"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface ThemeSwitchDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const themes = [
    { name: "light", icon: Sun, color: "text-yellow-500", selectedColor: "text-yellow-300" },
    { name: "dark", icon: Moon, color: "text-gray-700", selectedColor: "text-gray-200" },
    { name: "system", icon: Laptop, color: "text-blue-400", selectedColor: "text-blue-500" },
];

export function ThemeSwitchDialog({ isOpen, setIsOpen }: ThemeSwitchDialogProps) {
    const { theme, setTheme } = useTheme();

    const handleThemeChange = React.useCallback(
        (themeValue: "light" | "dark" | "system") => {
            setTheme(themeValue);
            setIsOpen(false);
        },
        [setTheme, setIsOpen]
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="w-fit bg-card rounded-lg p-6 font-sans">
                <DialogHeader>
                    <DialogTitle className="text-lg text-center font-semibold">Select Theme</DialogTitle>
                    <DialogDescription className="text-sm text-center text-muted-foreground">
                        Choose your preferred appearance mode.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 flex flex-row justify-center gap-3">
                    {themes.map(({ name, icon: Icon, color, selectedColor }) => (
                        <Button
                            key={name}
                            variant={theme === name ? "green" : "outline"}
                            className="flex flex-col items-center  gap-2 outline size-20 sm:size-28"
                            onClick={() => handleThemeChange(name as "light" | "dark" | "system")}
                        >
                            <Icon className={`size-4 sm:size-5 ${theme === name ? selectedColor : color}`} />
                            {name.charAt(0).toUpperCase() + name.slice(1)}
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}