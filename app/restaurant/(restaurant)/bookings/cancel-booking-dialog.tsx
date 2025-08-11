import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { refreshData } from "@/lib/swr";
import { OctagonAlert } from "lucide-react";
import toast from "react-hot-toast";
import { useCallback } from "react";

interface CancelBookingDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: T;
}

/* === Cancel Booking Dialog === */
export default function CancelBookingDialog<T extends { id?: number }>({
  open,
  onOpenChange,
  data,
}: CancelBookingDialogProps<T>) {

  /* === Confirm Cancellation Handler === */
  const handleConfirm = useCallback(async () => {
    const API_URL = "/api/bookings-tables";

    try {
      const response = await fetch(API_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: data.id, status: "cancelled" }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result?.message ?? "Reservation can't be updated. Please try again.");
        return;
      }

      toast.success(result?.message ?? "Reservation updated successfully.");
      onOpenChange(false);
      refreshData(API_URL);
    } catch (error) {
      console.error("Cancel failed:", error);
      toast.error("Something went wrong. Please try again.");
    }
  }, [data.id, onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="font-rubik-400">
        <AlertDialogHeader className="items-center">
          <AlertDialogTitle className="font-medium">
            {/* === Warning Icon === */}
            <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <OctagonAlert className="h-7 w-7 text-destructive" />
            </div>
            Confirm Cancellation
          </AlertDialogTitle>

          {/* === Description === */}
          <AlertDialogDescription className="text-sm text-center">
            This action will permanently cancel the selected <strong>Reservation</strong>. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* === Action Buttons === */}
        <AlertDialogFooter className="mt-2 sm:justify-center">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={handleConfirm}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
