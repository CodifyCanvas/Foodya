"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Table } from "@tanstack/react-table"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import Image from "next/image"
import { Icons } from "@/constants"

interface ExportButtonProps<TData> {
  table: Table<TData>
}

export function DataTableExport<TData>({ table }: ExportButtonProps<TData>) {
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
          const result = header({ column: col });
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
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
    XLSX.writeFile(workbook, "data.csv")
  }

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
    XLSX.writeFile(workbook, "data.xlsx")
  }


  const exportPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Foodya Restaurant", 14, 20)

    doc.setFontSize(10)
    doc.text("Find it. Eat it, Love it", 14, 25)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35)

    const columns = Object.keys(data[0] || {})

    const rows = data.map((item) =>
      columns.map((col) => item[col])
    )

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 42,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
      },
      margin: { top: 10 },
    })

    doc.save("data.pdf")
  }

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
