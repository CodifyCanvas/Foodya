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
import { Loader, OctagonAlert } from "lucide-react";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { refreshData } from "@/lib/swr";
import { Checkbox } from "@/components/ui/checkbox";

interface DeleteConfirmationDialogProps<T> {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    deletePayload: T;
    deleteEndpoint: string;
    title?: string;
    confirmMessage?: string;
    revalidateEndpoint?: string;
    checkbox?: {
        id?: string
        label: string;
        checked: boolean;
        onChange: (checked: boolean) => void;
    };
}

export default function DeleteConfirmationDialog<T>({
    isOpen,
    setIsOpen,
    deletePayload,
    deleteEndpoint,
    title,
    confirmMessage,
    revalidateEndpoint,
    checkbox
}: DeleteConfirmationDialogProps<T>) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = useCallback(async () => {
        try {
            setIsDeleting(true);

            const response = await fetch(deleteEndpoint, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(deletePayload),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result?.error ?? "Failed to delete. Please try again.");
                return;
            }

            toast.success(result?.message ?? "Successfully deleted.");
            refreshData(revalidateEndpoint ?? deleteEndpoint);
            setIsOpen(false);
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Unexpected error occurred. Please try again later.");
        } finally {
            setIsDeleting(false);
        }
    }, [deletePayload, deleteEndpoint, revalidateEndpoint, setIsOpen]);

    console.warn("Delete component render:");

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="font-rubik-400">
                <DialogHeader className="items-center">
                    <DialogTitle className="font-medium text-center">
                        <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                            <OctagonAlert className="h-7 w-7 text-destructive" />
                        </div>
                        {title ?? "Are you absolutely sure?"}
                    </DialogTitle>
                    <DialogDescription className="text-[15px] text-center">
                        {confirmMessage ??
                            "This action cannot be undone. This will permanently delete the selected item."}
                    </DialogDescription>
                </DialogHeader>

                {checkbox && (
                    <div className="flex items-center space-x-2 mt-4">
                        <Checkbox
                            id={checkbox.id ?? checkbox.label}
                            checked={checkbox.checked}
                            onCheckedChange={(checked) => {
                                if (checked === "indeterminate") return;
                                checkbox.onChange(checked);
                            }}
                            className="mx-auto data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 border-emerald-600"
                        />
                        <label htmlFor={checkbox.id ?? checkbox.label} className="text-sm">
                            {checkbox.label}
                        </label>
                    </div>
                )}

                <DialogFooter className="mt-2 sm:justify-center">
                    <Button
                        variant="outline"
                        className="min-w-28"
                        onClick={() => setIsOpen(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        className="min-w-28 flex items-center gap-2"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting && (
                            <Loader
                                className="animate-spin size-4 text-white"
                                aria-hidden="true"
                            />
                        )}
                        {isDeleting ? "Deleting..." : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}