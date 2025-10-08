import React from 'react';
import { EmployeePayrollTable } from '@/components/custom/payrolls/employee-view-payroll-table';
import EmployeePayrollTableActions from '@/components/custom/payrolls/employee-view-payroll-table-actions';

import { fetchEmployeeUnpaidPayrolls, getEmployeePayrollSummary } from '@/lib/crud-actions/payrolls';
import { EmployeeCompleteDetailsInterface, PayrollDialogSalaryRow } from '@/lib/definations';

// === Component Props Interface ===
interface SalaryHistoryProps {
  data: EmployeeCompleteDetailsInterface;
  from?: string;
  to?: string;
  status?: 'pending' | 'paid' | 'all';
}

const SalaryHistory = async ({ data: employeeDetails, from, to, status = 'all' }: SalaryHistoryProps) => {

  // === Fetch Employee Payroll Records (filtered by status and date) ===
  const payrollRecords: PayrollDialogSalaryRow[] = await fetchEmployeeUnpaidPayrolls( employeeDetails.id, status, from, to
  );

  // === Fetch Summary of Payroll Data for Employee ===
  const payrollSummary = await getEmployeePayrollSummary(employeeDetails.id);

  // === Render Payroll Actions and Payroll Table ===
  return (
    <>
      <EmployeePayrollTableActions
        data={{ payrollSummary, employee: employeeDetails, salaries: payrollRecords, }}
      />
      
      <EmployeePayrollTable data={payrollRecords} />
    </>
  );
};

export default SalaryHistory;
