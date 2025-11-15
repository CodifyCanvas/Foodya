'use client'

import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TableRow, TableCell } from "../ui/table"
import { Skeleton } from "../ui/skeleton"
import Masonry from "react-masonry-css"



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



/**
 * === Masonry Menu Items Loading Skeleton ===
 * Displays a skeleton table with configurable number of columns and rows.
 * 
 * @param count - Number of columns (default: 5)
 */
export const MenuItemSkeleton = ({ count = 12 }) => {

  const fixedHeights = [320, 380, 410, 450, 500];

  return (
    <Masonry
      breakpointCols={{
        default: 4,
        1200: 3,
        900: 2,
        500: 1,
      }}
      className="flex w-full gap-8 pt-8 px-4"
      columnClassName="flex flex-col gap-16"
    >
      {Array.from({ length: count }).map((_, i) => {
        const height = fixedHeights[i % fixedHeights.length];

        return (
          <div
            key={i}
            className="w-[17rem] mx-auto rounded-lg bg-white/10 backdrop-blur-2xl animate-pulse"
            style={{ height: `${height}px` }}
          />
        );
      })}
    </Masonry>
  );
};



/**
 * === Categories Bar Loading Skeleton ===
 * Displays a horizontal skeleton placeholder with gradient edges,
 */
export const SkeletonCategoriesBar = () => {
  return (
    <div className="relative flex items-center justify-center select-none animate-pulse">
      {/* Left gradient */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-black/10 to-transparent z-10" />

      {/* Right gradient */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-black/10 to-transparent z-10" />

      {/* Scroll Area */}
      <div className="overflow-x-hidden scrollbar-hidden px-10 py-2 mb-4">
        <div className="flex gap-3 min-w-max">
          {/* Fake skeleton buttons */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-10 sm:h-12 w-full sm:w-32 rounded-md bg-white/10 backdrop-blur-2xl border border-neutral-700/40"
            >
              {/* Inner badge placeholder */}
              <div className="h-full w-full flex items-center justify-between gap-2 px-4">
                <div className="h-3 w-14 bg-white/20 rounded" />

                <div className="h-4 w-4 bg-white/20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};