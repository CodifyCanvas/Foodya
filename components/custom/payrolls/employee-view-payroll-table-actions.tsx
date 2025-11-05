'use client';

// === Imports ===
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { FunnelPlus, FunnelX, Printer } from 'lucide-react';

import { Input } from '@/components/ui/input';
import SelectInput from '@/components/ui/select-input';
import { Button } from '@/components/ui/button';

import { formatDateWithFns } from '@/lib/date-fns';
import {
  EmployeeCompleteDetailsInterface,
  PayrollDialogSalaryRow,
  PayrollSummary,
  PayrollTableActionsProps,
} from '@/lib/definations';



// === Definition ===
// Provides filter controls and payroll statement printing for an employee's payroll table.
const EmployeePayrollTableActions = ({ data }: PayrollTableActionsProps) => {
  // === Hooks ===
  const router = useRouter();
  const searchParams = useSearchParams();

  // === State: Filters ===
  const [startDate, setStartDate] = useState<string>(searchParams.get('from') || '');
  const [endDate, setEndDate] = useState<string>(searchParams.get('to') || '');
  const [status, setStatus] = useState<string | undefined>(searchParams.get('status') || 'all');

  // === Derived: Check if any filters are active ===
  const filtersApplied = startDate || endDate || (status && status !== 'all');

  // === Handler: Apply Filters ===
  const handleApplyFilters = () => {
    if (startDate && endDate) {
      const from = new Date(`${startDate}-01`);
      const to = new Date(`${endDate}-01`);

      if (from > to) {
        toast.error('The start month must not be later than the end month.');
        return;
      }
    }

    const params = new URLSearchParams(searchParams.toString());

    if (startDate) {
      params.set('from', startDate);
    } else {
      params.delete('from');
    }

    if (endDate) {
      params.set('to', endDate);
    } else {
      params.delete('to');
    }

    if (status && status !== 'all') {
      params.set('status', status)
    } else {
      params.delete('status');
    }

    router.replace(`?${params.toString()}`);
  };

  // === Handler: Reset Filters ===
  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatus('all');

    const params = new URLSearchParams(searchParams.toString());
    params.delete('from');
    params.delete('to');
    params.delete('status');

    router.replace(`?${params.toString()}`);
  };

  // === Render ===
  return (
    <div className="flex flex-wrap gap-4 items-end mb-4">

      {/* === Filter: Start Month === */}
      <div className="flex flex-col">
        <label htmlFor="from" className="text-xs text-muted-foreground">From</label>
        <Input
          id="from"
          type="month"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      {/* === Filter: End Month === */}
      <div className="flex flex-col">
        <label htmlFor="to" className="text-xs text-muted-foreground">To</label>
        <Input
          id="to"
          type="month"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* === Filter: Payment Status === */}
      <div className="flex flex-col">
        <label htmlFor="status" className="text-xs text-muted-foreground">Status</label>
        <SelectInput
          id="status"
          value={status}
          onChange={(value) => setStatus(value)}
          className="w-full rounded-lg"
          placeholder="Select option"
          options={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Unpaid' },
            { value: 'paid', label: 'Paid' },
          ]}
        />
      </div>

      {/* === Button: Apply Filters === */}
      <Button onClick={handleApplyFilters} variant="green">
        <FunnelPlus />
        <span className="md:block hidden">Filter</span>
      </Button>

      {/* === Button: Reset Filters === */}
      {filtersApplied && (
        <Button
          onClick={handleResetFilters}
          variant="destructive"
          title="Clear all filters"
          size='icon'
        >
          <FunnelX />
        </Button>
      )}

      {/* === Button: Print Payroll Statement === */}
      <Button title="Print Payroll Statement" onClick={() => handlePrintPayrollStatement(data)} variant="outline">
        <Printer className="h-4 w-4" />
        <span className="md:block hidden">Print Statement</span>
      </Button>
    </div>
  );
};

function handlePrintPayrollStatement(data: {
  payrollSummary: PayrollSummary;
  employee: EmployeeCompleteDetailsInterface;
  salaries: PayrollDialogSalaryRow[];
}) {
  const { payrollSummary, employee, salaries } = data;

  if (!employee || !salaries || salaries.length === 0) {
    toast.error('No payroll data available to print.');
    return;
  }

  const printDate = formatDateWithFns(new Date(), {
    showTime: true,
    monthFormat: 'long',
    yearFormat: 'long',
    showSeconds: true,
  });

  const employeeInfoHTML = `
    <p><strong>Employee ID:</strong> ${employee.id}</p>
    <p><strong>Name:</strong> ${employee.name}</p>
    <p><strong>CNIC:</strong> ${employee.CNIC}</p>
    <p><strong>Designation:</strong> ${employee.employmentRecord[0]?.designation || 'N/A'}</p>
    <p><strong>Email:</strong> ${employee.email}</p>
  `;

  const salaryRowsHTML = salaries.map((entry) => `
    <tr>
      <td>${entry.month}</td>
      <td>${entry.basicPay.toLocaleString()}</td>
      <td>${entry.bonus?.toLocaleString() || '0'}</td>
      <td>${entry.penalty?.toLocaleString() || '0'}</td>
      <td>${entry.totalPay.toLocaleString()}</td>
      <td>${entry.paidAt ? 'Paid' : 'Unpaid'}</td>
      <td>${entry.paidAt ? formatDateWithFns(entry.paidAt, { showTime: true }) : '-'}</td>
    </tr>
  `).join('');

  const summaryHTML = `
    <p><strong>Paid Months:</strong> ${payrollSummary.totalPaidMonths}</p>
    <p><strong>Unpaid Months:</strong> ${payrollSummary.totalUnpaidMonths}</p>
    <p><strong>Total Paid:</strong> ${payrollSummary.totalAmountPaid}</p>
    <p><strong>Total Pending:</strong> ${payrollSummary.totalAmountPending}</p>
  `;

  const printableHTML = `
    <html>
      <head>
        <title>Payroll Statement</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; font-size: 13px; }
          h3, h4 { margin: 0 0 8px; font-weight: 600; }
          p { margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: center; font-size: 12px; }
          th { background-color: #f9f9f9; font-weight: 600; }
          tr:nth-child(even) { background-color: #fafafa; }
          #summary-div { margin-top: 20px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h3>Foodya</h3>
        <p><em>Find it, Eat it, Love it</em></p>

        <h4 style="margin-top: 10px; margin-bottom: 10px">Employee Payroll Statement</h4>

        ${employeeInfoHTML}

        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Basic Pay</th>
              <th>Bonus</th>
              <th>Penalty</th>
              <th>Total Pay</th>
              <th>Status</th>
              <th>Paid At</th>
            </tr>
          </thead>
          <tbody>
            ${salaryRowsHTML}
          </tbody>
        </table>

        <div id="summary-div">
          ${summaryHTML}
        </div>

        <p style="margin-top: 24px;"><strong>Printed on:</strong> ${printDate}</p>

        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printableHTML);
    printWindow.document.close();
  } else {
    toast.error('Unable to open print window.');
  }
}


export default EmployeePayrollTableActions;

