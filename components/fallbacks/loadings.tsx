import { Loader } from "lucide-react"
import { ScrollBar } from "../ui/scroll-area";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { cn } from "@/lib/utils";



/**
 * === PageLoadingScreen ===
 * Displays a full-page loading spinner centered both vertically and horizontally.
 */
export const PageLoadingScreen = () => {
    return (
        <div className="flex-1 h-full w-full bg-card outline outline-accent flex justify-center items-center">
            <Loader className="animate-spin size-7 text-gray-500" />
        </div>
    )
}



/**
 * === FormsLoadingScreen ===
 * Displays a full-form loading spinner centered both vertically and horizontally.
 */
export const FormsLoadingScreen = () => {
    return (
        <div className="flex-1 h-full w-full bg-card  flex justify-center items-center">
            <Loader className="animate-spin size-7 text-gray-500" />
        </div>
    )
}



/**
 * === PageLoadingTableScreen ===
 * Displays a skeleton of a table with configurable rows, columns, and action buttons.
 * Includes placeholders for a search bar, action buttons, table content, and pagination.
 *
 * @param buttonCount - Number of action button placeholders to render (default: 0)
 * @param columns - Number of table columns (default: 3)
 * @param rows - Number of table rows (default: 8)
 * @param className - Optional additional CSS classes to customize the container
 */
export const PageLoadingTableScreen = ({
    buttonCount = 0,
    columns = 3,
    rows = 8,
    className
}: {
    buttonCount?: number;
    columns?: number;
    rows?: number;
    className?: string;
}) => {
    return (
        <div className={cn("flex flex-col gap-4 p-4 w-full", className)}>
            {/* Toolbar */}
            <div className="flex justify-between items-center py-2 gap-2">
                {/* Search bar skeleton */}
                <div className="w-40 lg:w-52 h-10 bg-muted-foreground/20 rounded-md animate-pulse" />

                {/* Action buttons skeleton */}
                <div className="flex gap-2">
                    {buttonCount > 0 &&
                        Array.from({ length: buttonCount }).map((_, i) => (
                            <div key={`button-${i}`} className="w-10 md:w-20 h-10 bg-muted-foreground/30 rounded-md animate-pulse" style={{
                                animationDelay: `${i * 100}ms`
                            }}
                            />
                        ))}
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="w-full overflow-hidden border-t border-b">
                <ScrollArea className="w-full">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-muted/50">
                                {Array.from({ length: columns }).map((_, i) => (
                                    <TableHead key={`header-${i}`} className="h-10" >
                                        <div className="h-4 w-full  max-w-[120px] bg-muted-foreground/25 rounded animate-pulse" style={{
                                            animationDelay: `${i * 50}ms`
                                        }}
                                        />
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: rows }).map((_, rowIndex) => (
                                <TableRow key={`row-${rowIndex}`} className="hover:bg-muted/50">
                                    {Array.from({ length: columns }).map((_, colIndex) => (
                                        <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                                            <div className="h-4 w-full max-w-[150px] rounded bg-muted-foreground/20 animate-pulse" style={{
                                                animationDelay: `${(rowIndex * columns + colIndex) * 50}ms`
                                            }}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                {/* Pagination Skeleton */}
                {true && (
                    <div className="flex flex-col gap-2 lg:flex-row md:gap-0 items-center justify-between py-5 space-y-1 px-2 sm:px-5">
                        <div className="h-4 w-40 bg-muted-foreground/20 rounded animate-pulse" />

                        <div className="flex flex-col md:flex-row gap-3 items-center">
                            <div className="h-4 w-32 bg-muted-foreground/20 rounded animate-pulse" />
                            <div className="h-4 w-28 bg-muted-foreground/20 rounded animate-pulse" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};