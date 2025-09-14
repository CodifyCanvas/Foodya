"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Table } from "@tanstack/react-table"
import ExcelJS from "exceljs"
import { saveAs } from 'file-saver';
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import Image from "next/image"
import { Icons } from "@/constants"

interface ExportButtonProps<TData extends Record<string, any>> {
  table: Table<TData>
}

export function DataTableExport<TData extends Record<string, any>>({ table }: ExportButtonProps<TData>) {

  const data = table.getFilteredRowModel().rows.map((row) => row.original)

  const exportCopy = () => {
    // // Get all rows that match current filters/search (ignores pagination)
    // const rows = table.getFilteredRowModel().rows;

    // Get only the rows visible on the current page (respects pagination and filters)
    const rows = table.getPaginationRowModel().rows;

    // Exclude columns with id "no-print"
    const columns = table
      .getVisibleFlatColumns()
      .filter((col) => col.id !== "actions");

    if (rows.length === 0 || columns.length === 0) return;

    // Extract clean header titles
    const headers = columns.map(col => {
      const header = col.columnDef.header;

      if (typeof header === "string") return header.replace(/"/g, '""');
      if (typeof header === "function") {
        try {
          // Cast to any to avoid TS errors, since we only want string output
          const result = (header as any)({ column: col });
          if (typeof result === "string") return result.replace(/"/g, '""');
        } catch { }
      }

      return col.id.replace(/"/g, '""');
    });

    const csvRows = [
      headers.join(","), // header row
      ...rows.map(row =>
        columns.map(col => {
          const cellValue = row.getValue(col.id);
          const text =
            typeof cellValue === "string" || typeof cellValue === "number"
              ? cellValue.toString()
              : JSON.stringify(cellValue ?? "");
          return `"${text.replace(/"/g, '""')}"`;
        }).join(",")
      )
    ];

    const csv = csvRows.join("\n");

    navigator.clipboard.writeText(csv)
      .then(() => {
        console.log("Table copied to clipboard in CSV format");
      })
      .catch(err => {
        console.error("Failed to copy table:", err);
      });
  };

  const exportCSV = () => {
    // Get visible columns (excluding actions or hidden columns)
    const columns = table
      .getVisibleFlatColumns()
      .filter((col) => col.id !== "actions")
      .map((col) => col.id);

    if (data.length === 0 || columns.length === 0) return;

    // Prepare CSV rows: header + filtered rows
    const csvRows = [
      columns.join(","), // header row with visible columns
      ...data.map((row) =>
        columns
          .map((col) => {
            const val = row[col];
            return `"${String(val ?? "").replace(/"/g, '""')}"`
          })
          .join(",")
      ),
    ];

    const csv = csvRows.join("\n");

    // Download CSV file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const exportExcel = async () => {
    const columns = table
      .getVisibleFlatColumns()
      .filter((col) => col.id !== "actions")
      .map((col) => ({
        header: typeof col.columnDef.header === "string" ? col.columnDef.header : col.id,
        key: col.id,
        width: 20,
      }));

    if (data.length === 0 || columns.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.columns = columns;

    data.forEach((row) => {
      const filteredRow: Record<string, any> = {};
      columns.forEach((col) => {
        filteredRow[col.key] = row[col.key];
      });
      worksheet.addRow(filteredRow);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "data.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Foodya Restaurant", 14, 20);
    doc.setFontSize(10);
    doc.text("Find it. Eat it, Love it", 14, 25);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);

    // Get visible columns (excluding "actions")
    const visibleColumns = table
      .getVisibleFlatColumns()
      .filter((col) => col.id !== "actions");

    const headers = visibleColumns.map((col) =>
      typeof col.columnDef.header === "string" ? col.columnDef.header : col.id
    );

    const keys = visibleColumns.map((col) => col.id);

    // Prepare data rows with only visible keys
    const rows = data.map((row) =>
      keys.map((key) => {
        const value = row[key];
        return typeof value === "boolean"
          ? value ? "Online" : "Offline"
          : String(value ?? "");
      })
    );

    // Generate PDF table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 42,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
      },
      margin: { top: 10 },
    });

    doc.save("data.pdf");
  };

  const printTable = () => {
    const original = document.querySelector("#table-to-print table");
    if (!original) return;

    // Clone the original table
    const table = original.cloneNode(true) as HTMLTableElement;

    // Find the index of the "actions" column (by id, text, or class)
    const headerCells = table.querySelectorAll("thead th");
    let actionsIndex = -1;

    headerCells.forEach((th, i) => {
      const text = th.textContent?.toLowerCase().trim();
      if (text === "actions" || th.id === "actions" || th.classList.contains("no-print")) {
        actionsIndex = i;
        th.remove();
      }
    });

    // Remove the corresponding cells in each row
    if (actionsIndex > -1) {
      table.querySelectorAll("tbody tr").forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells[actionsIndex]) cells[actionsIndex].remove();
      });
    }

    // Open print window
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
    <html>
      <head>
        <title>Print Table</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f3f3f3; }
          button { all: unset; pointer-events: none; cursor: default; color: inherit; }
          svg.lucide, svg.lucide-react { display: none !important; }
          button svg { display: none !important; }
        </style>
      </head>
      <body>
        <h3>Foodya</h3>
        <p>Find it, Eat it, Love it</p>
        ${table.outerHTML}
      </body>
    </html>
  `);

    win.document.close();
    win.focus();
    win.onload = () => {
      win.print();
      win.close();
    };
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          <span className="md:block hidden font-rubik-400">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-xs md:w-sm flex font-rubik-400 flex-wrap text-sm">
        <div className="w-1/2">
          <ExportItem icon={Icons.copy} label="Copy" onClick={exportCopy} />
          <ExportItem icon={Icons.csv} label="CSV" onClick={exportCSV} />
          <ExportItem icon={Icons.xls} label="Excel" onClick={exportExcel} />
        </div>
        <div className="w-1/2">
          <ExportItem icon={Icons.pdf} label="PDF" onClick={exportPDF} />
          <ExportItem icon={Icons.printer} label="Print" onClick={printTable} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const ExportItem = ({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) => (
  <DropdownMenuItem onClick={onClick} className="cursor-pointer">
    <div className="min-w-10 min-h-10 flex items-center justify-center relative overflow-hidden rounded-sm bg-black/5 transition-colors duration-200">
      <Image src={icon} alt={label} width={48} height={48} className="object-contain absolute w-7 h-7" />
    </div>
    {label}
  </DropdownMenuItem>
)
