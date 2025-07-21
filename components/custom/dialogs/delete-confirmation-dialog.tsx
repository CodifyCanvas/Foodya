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
import { OctagonAlert } from "lucide-react";

interface DeleteConfirmationDialogProps<T> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: T;
    dbTable: string;
    tableName: string;
}

export default function DeleteConfirmationDialog<T extends { id?: number }>({
    open,
    onOpenChange,
    data,
    dbTable,
    tableName,
}: DeleteConfirmationDialogProps<T>) {

    // Handler for confirm button click
    const handleConfirm = async () => {
        try {
            console.log("deleted row id: ", data.id, " from ", dbTable, " table ")  
            onOpenChange(false);      
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="font-rubik-400">
                <AlertDialogHeader className="items-center">
                    <AlertDialogTitle className="font-medium">
                        <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                            <OctagonAlert className="h-7 w-7 text-destructive" />
                        </div>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[15px] text-center">
                        This will permanently remove a <strong>{tableName}</strong> entry.
                    </AlertDialogDescription>
                </AlertDialogHeader>
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
