'use client'

import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table"

export function ReportsHeaderCardSkeleton() {
  const skeletons = new Array(4).fill(null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 *:data-[slot=card]:shadow-xs">
      {skeletons.map((_, index) => (
        <Card key={index} className="@container/card animate-pulse bg-white">
          <CardHeader>
            <CardDescription>
              <div className="h-4 w-24 rounded bg-gray-200" />
            </CardDescription>

            <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
              <div className="h-6 w-32 rounded bg-gray-300" />
            </CardTitle>

            <div className="mt-2 h-4 w-16 rounded bg-gray-200" />
          </CardHeader>

          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-4 w-28 rounded bg-gray-100" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export function DataTableSkeleton({
  columnCount = 5,
  rowCount = 8,
  className
}: { columnCount?: number; rowCount?: number; className?: string }) {
  const columns = new Array(columnCount).fill(null)
  const rows = new Array(rowCount).fill(null)

  return (
    <div className={cn("w-full overflow-hidden  border-t border-b my-5", className)}>
          {rows.map((_, rowIndex) => (
            <TableRow key={`row-${rowIndex}`}>
              {columns.map((_, colIndex) => (
                <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                  <div className="h-4 w-full max-w-[150px] rounded bg-gray-100 animate-pulse" />
                </TableCell>
              ))}
            </TableRow>
          ))}
    </div>
  )
}
