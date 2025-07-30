import { ColumnDef } from "@tanstack/react-table"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    title?: string
  }
}

export type ExtendedColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  accessorKey?: string
  defaultVisible?: boolean
}
