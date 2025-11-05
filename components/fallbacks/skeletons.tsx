'use client'

import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TableRow, TableCell } from "../ui/table"
import { Skeleton } from "../ui/skeleton"



/**
 * === ReportsHeaderCardSkeleton ===
 * Displays a grid of skeleton cards representing report headers while loading.
 */
export function ReportsHeaderCardSkeleton() {
  const skeletons = new Array(4).fill(null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 *:data-[slot=card]:shadow-xs">
      {skeletons.map((_, index) => (
        <Card key={index} className="@container/card bg-card border-border">
          <CardHeader className="space-y-3">
            <CardDescription>
              <div className="h-4 w-24 rounded bg-muted-foreground/20 animate-pulse" />
            </CardDescription>

            <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
              <div className="h-6 w-32 rounded bg-muted-foreground/25 animate-pulse" />
            </CardTitle>

            <div className="h-4 w-16 rounded bg-muted-foreground/15 animate-pulse" />
          </CardHeader>

          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="h-4 w-36 rounded bg-muted-foreground/15 animate-pulse" />
            <div className="h-4 w-28 rounded bg-muted-foreground/15 animate-pulse" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}



/**
 * === DataTableSkeleton ===
 * Displays a skeleton table with configurable number of columns and rows.
 * 
 * @param columnCount - Number of columns (default: 5)
 * @param rowCount - Number of rows (default: 8)
 * @param className - Optional additional CSS classes
 */
export function DataTableSkeleton({
  columnCount = 5,
  rowCount = 8,
  className
}: { columnCount?: number; rowCount?: number; className?: string }) {
  const columns = new Array(columnCount).fill(null)
  const rows = new Array(rowCount).fill(null)

  return (
    <div className={cn("w-full overflow-hidden border-t border-b my-5", className)}>
      {rows.map((_, rowIndex) => (
        <TableRow key={`row-${rowIndex}`} className="hover:bg-muted/50">
          {columns.map((_, colIndex) => (
            <TableCell key={`cell-${rowIndex}-${colIndex}`}>
              <div
                className="h-4 w-full max-w-[150px] rounded bg-muted-foreground/20 animate-pulse"
                style={{
                  animationDelay: `${(rowIndex * columnCount + colIndex) * 50}ms`
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </div>
  )
}



/**
 * === HoverTransactionCardSkeleton ===
 * Displays a skeleton placeholder for a transaction card with header, content sections, summary, total, and footer.
 * Useful for loading states while transaction data is being fetched.
 *
 * Structure:
 * - Header Skeleton: Simulates card title and metadata.
 * - Quick Info Section: Placeholder for key transaction info.
 * - Main Content Box: Placeholder for detailed transaction content.
 * - Summary Lines: Placeholder for summarized transaction values.
 * - Total Box: Placeholder for the total transaction amount.
 * - Footer: Optional bottom placeholder element.
 */
export function HoverTransactionCardSkeleton() {
  return (
    <div className="font-rubik bg-card text-card-foreground shadow-sm rounded-lg overflow-hidden max-w-sm">
      {/* Header Skeleton */}
      <div className="bg-muted px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32 bg-muted-foreground/20" />
          <Skeleton className="h-5 w-16 rounded-full bg-muted-foreground/20" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Quick Info Section */}
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16 bg-muted-foreground/15" />
            <Skeleton className="h-4 w-24 bg-muted-foreground/20" />
          </div>
          <div className="space-y-1.5 text-right">
            <Skeleton className="h-3 w-20 bg-muted-foreground/15" />
            <Skeleton className="h-4 w-20 bg-muted-foreground/20" />
          </div>
        </div>

        {/* Main Content Box */}
        <div className="bg-muted/50 rounded-md p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-12 bg-muted-foreground/15" />
            <Skeleton className="h-4 w-16 rounded bg-muted-foreground/15" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-full bg-muted-foreground/20" />
            <Skeleton className="h-3 w-5/6 bg-muted-foreground/20" />
            <Skeleton className="h-3 w-4/6 bg-muted-foreground/20" />
          </div>
        </div>

        {/* Summary Lines */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20 bg-muted-foreground/15" />
            <Skeleton className="h-3 w-16 bg-muted-foreground/15" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24 bg-muted-foreground/15" />
            <Skeleton className="h-3 w-16 bg-muted-foreground/15" />
          </div>
        </div>

        {/* Total Box */}
        <div className="bg-muted/50 rounded-md p-2.5">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-20 bg-muted-foreground/20" />
            <Skeleton className="h-5 w-24 bg-muted-foreground/20" />
          </div>
        </div>

        {/* Footer */}
        <Skeleton className="h-3 w-32 mx-auto bg-muted-foreground/15" />
      </div>
    </div>
  )
}