"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader, LogOut } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { appConfigurations } from "@/constants";

interface LogoutConfirmationDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}



/**
 * === Logout Confirmation Dialog ===
 *
 * Displays a confirmation prompt before logging the user out.
 * Handles loading state, triggers NextAuth sign-out, and redirects
 * to the configured logout URL.
 *
 * @param isOpen - Whether the dialog is visible.
 * @param setIsOpen - Function to toggle dialog visibility.
 */
export default function LogoutConfirmationDialog({
    isOpen,
    setIsOpen,
}: LogoutConfirmationDialogProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await signOut({ callbackUrl: "/" });
            window.location.href = appConfigurations.logoutURL;
        } catch (error) {
            console.error("Logout failed: ", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="font-rubik-400">
                <DialogHeader className="items-center">
                    <DialogTitle className="font-medium text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                            <LogOut className="h-7 w-7 text-destructive" />
                        </div>
                        Ready to log out?
                    </DialogTitle>
                    <DialogDescription className="text-[15px] text-center">
                        You will be logged out of your account.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-2 sm:justify-center">
                    <Button variant="outline" className="min-w-28" onClick={() => setIsOpen(false)} disabled={isLoggingOut} >
                        Cancel
                    </Button>
                    <Button variant="destructive" className="min-w-28 flex items-center gap-2" onClick={handleLogout} disabled={isLoggingOut} >
                        {isLoggingOut ? <p className="flex flex-row gap-2"><Loader className="animate-spin size-4 text-white" aria-hidden="true" /><span>Logging out</span></p> : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}