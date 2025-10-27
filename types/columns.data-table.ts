import { ColumnDef } from "@tanstack/react-table";

/* === Extend the ColumnMeta interface === */
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    /**
     * Optional human-readable title for the column
     * Can be used for headers, Column Visibily Dropdown, or accessibility
     */
    title?: string;
  }
}

/* === Extended Column Definition Type === */
export type ExtendedColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  /**
   * Optional accessor key for simple value access
   */
  accessorKey?: string;

  /**
   * Whether the column should be visible by default
   * Defaults to true unless explicitly set to false
   */
  defaultVisible?: boolean;
};
