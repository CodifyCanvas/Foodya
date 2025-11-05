import { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {

  // === Destructure table state ===
  const { pagination: { pageIndex, pageSize } } = table.getState()

  // === Compute derived values once ===
  const totalRows = table.getFilteredRowModel().rows.length       // <- calculate total number of filtered rows
  const pageCount = table.getPageCount()                          // <- get total number of pages
  const canPrevious = table.getCanPreviousPage()                  // <- check if previous page is available
  const canNext = table.getCanNextPage()                          // <- check if next page is available

  const startRow = pageIndex * pageSize + 1                       // <- calculate starting row index for current page
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)  // <- calculate ending row index without exceeding total rows


  return (
    <div className="flex flex-col gap-2 lg:flex-row md:gap-0 items-center justify-between py-5 px-2 sm:px-5">

      {/* === Display current row range (e.g., "Showing 1 to 10 of 50 records") === */}
      <div className="text-muted-foreground flex-1 text-sm">
        {`Showing ${startRow} to ${endRow} of ${totalRows} records`}
      </div>

      <div className="flex flex-col gap-2 w-full md:mt-2 lg:mt-0 lg:w-fit justify-between md:flex-row md:gap-0 items-center space-x-6 lg:space-x-8">

        {/* === Rows per page selector === */}
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Rows per page</p>
          <Select value={`${pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))} >
            <SelectTrigger className="h-8 w-[70px] text-sm">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="font-sans">
              {[10, 20, 25, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* === Page info (e.g., "Page 2 of 5") === */}
        <div className="flex w-[100px] text-muted-foreground items-center justify-center text-sm">
          Page &nbsp;
          <span className="font-medium cursor-help" title="Current page number">
            {pageIndex + 1}
          </span>
          &nbsp; of &nbsp;
          <span className="font-medium cursor-help" title="Total number of pages">
            {pageCount}
          </span>
        </div>

        {/* === Pagination controls (first, previous, next, last) === */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" title="Go to first page" className="size-8" onClick={() => table.setPageIndex(0)} disabled={!canPrevious}>
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>

          <Button variant="outline" size="icon" title="Go to previous page" className="size-8" onClick={() => table.previousPage()} disabled={!canPrevious} >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>

          <Button variant="outline" size="icon" title="Go to next page" className="size-8" onClick={() => table.nextPage()} disabled={!canNext} >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>

          <Button variant="outline" size="icon" title="Go to last page" className="size-8" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!canNext}>
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}