"use client"

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header"
import { RowActions } from "./table-actions"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { EmployeesSalaryGeneralDetails } from "@/lib/definations"
import { Badge } from "@/components/ui/badge"
import { parse, format } from "date-fns"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toCapitalizedWords } from "@/lib/utils"

// === Status Styles for Badge and Dots ===
const statusStyles: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-400",
  pending: "bg-pink-200 text-pink-700 dark:bg-pink-400/10 dark:text-pink-400",
  unknown: "bg-gray-200 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400",
}

const dotColors: Record<string, string> = {
  paid: "bg-emerald-600 dark:bg-emerald-400",
  pending: "bg-pink-600 dark:bg-pink-400",
  unknown: "bg-gray-600 dark:bg-gray-400",
}

/* === Payroll Table Columns === */
export const columns = (): ExtendedColumnDef<EmployeesSalaryGeneralDetails>[] => [
  
  // === Id Column ===
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="#"
        className="ml-2 md:ml-5"
        search
      />
    ),
    cell: ({ row }) => (
      <div className="pl-3 md:pl-5">{row.index + 1}</div>
    ),
  },

  // === Employee Name Column ===
  {
    accessorKey: "employee",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Employee"
      />
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.original.employee}</div>
    ),
  },
  
  // === Employee Designation Column ===
  {
    accessorKey: "designation",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Designation"
      />
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.original.designation}</div>
    ),
  },
  
  // === Employee Unpaid Months Column ===
{
  accessorKey: "unpaidMonths",
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Unpaid Months"
    />
  ),
  cell: ({ row }) => {
    const months: string[] = row.original.unpaidMonths;

    // Format each "YYYY-MM" to "MMM yyyy"
    const formattedMonths = months.map((ym) => {
      const parsedDate = parse(ym, "yyyy-MM", new Date());
      return format(parsedDate, "MMM yyyy");
    });

    const count = months.length;
    const label = count === 0 ? "—" : `${count} Month${count > 1 ? "s" : ""}`;

    return count > 0 ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-center cursor-default">
            {label}
          </div>
        </TooltipTrigger>
        <TooltipContent className="text-sm max-w-xs text-center">
          {formattedMonths.join(", ")}
        </TooltipContent>
      </Tooltip>
    ) : (
      <div className="text-center">—</div>
    );
  },
},

  // === Employee Current Salary Column ===
{
  accessorKey: "currentSalary",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Current Salary" />
  ),
  cell: ({ row }) => {
    const value = row.original.currentSalary;
    const tooltipText = value ? toCapitalizedWords(value) : null;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-center cursor-default">
            {value ?? "—"}
          </div>
        </TooltipTrigger>
        {tooltipText && (
          <TooltipContent className="text-sm max-w-xs text-center">
            <p>{tooltipText}</p>
          </TooltipContent>
        )}
      </Tooltip>
    );
  },
},

// === Employee Previous Balance Column ===
{
  accessorKey: "prevBalance",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Previous Balance" />
  ),
  cell: ({ row }) => {
    const value = row.original.prevBalance;
    const tooltipText = value ? toCapitalizedWords(value) : null;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-center cursor-default">
            {value ?? "—"}
          </div>
        </TooltipTrigger>
        {tooltipText && (
          <TooltipContent className="text-sm max-w-xs text-center">
            <p>{tooltipText}</p>
          </TooltipContent>
        )}
      </Tooltip>
    );
  },
},

  // === Salaries Paid Status Column ===
  {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Status"
          filter={["paid", "pending"]}
        />
      ),
      cell: ({ row }) => {
        const rawStatus = row.original.status
        const status = rawStatus?.toLowerCase() || "unknown"
  
        return (
          <Badge
            className={`rounded-full capitalize font-rubik-400 border-none min-w-16 focus-visible:outline-none focus-visible:ring-2 flex items-center justify-center focus-visible:ring-opacity-20 ${statusStyles[status]}`}
          >
            <span
              className={`size-1.5 rounded-full inline-block ${dotColors[status]}`}
              aria-hidden="true"
            />
            {status}
          </Badge>
        )
      },
    },

  // === Actions Column ===
  {
    id: "actions",
    header: () => (
      <div className="text-right text-xs font-rubik-500 uppercase pr-10 md:pr-14">
        Actions
      </div>
    ),
    cell: ({ row }) => (
      <RowActions
        data={{ employeeId: row.original.employeeId }}
        className="pr-3 md:pr-5"
      />
    ),
  },
]
