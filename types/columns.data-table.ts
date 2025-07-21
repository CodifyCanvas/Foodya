import { ColumnDef } from "@tanstack/react-table"

export type ExtendedColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  accessorKey?: string
  defaultVisible?: boolean
}
