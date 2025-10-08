import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDateWithFns } from '@/lib/date-fns';
import { PayrollDialogSalaryRow } from '@/lib/definations';
import { formatMonthYear, toCapitalizedWords } from '@/lib/utils';
import React from 'react';

export const EmployeePayrollTable = ({ data }: { data: PayrollDialogSalaryRow[] }) => {
    return (
        <div className="grid w-full [&>div]:max-h-[60vh] border-b [&>div]:rounded overflow-auto">
            <Table>
                {/* === Table Header === */}
                <TableHeader>
                    <TableRow className="bg-white text-neutral-500 hover:bg-white sticky top-0 uppercase text-xs [&>*]:whitespace-nowrap">
                        <TableHead className="pl-4 text-neutral-500">S.No</TableHead>
                        <TableHead className="text-neutral-500">Month</TableHead>
                        <TableHead className="text-neutral-500">Basic Pay</TableHead>
                        <TableHead className="text-neutral-500">Bonus</TableHead>
                        <TableHead className="text-neutral-500">Penalty</TableHead>
                        <TableHead className="text-neutral-500">Total</TableHead>
                        <TableHead className="text-neutral-500">Status</TableHead>
                    </TableRow>
                </TableHeader>

                {/* === Table Body === */}
                <TableBody>
                    {data.map((record, index) => (
                        <TableRow key={record.id} className="[&>*]:whitespace-nowrap h-10 font-rubik-400">
                            <TableCell className="pl-4">{index + 1}</TableCell>
                            <TableCell>{formatMonthYear(record.month)}</TableCell>
                            <TableCell>{record.basicPay}</TableCell>
                            <TableCell>{record.bonus}</TableCell>
                            <TableCell>{record.penalty}</TableCell>

                            {/* === Total Pay (Tooltip) === */}
                            <TableCell>
                                {record.totalPay ? (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <span className="cursor-help">{record.totalPay}</span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-sm">
                                            {toCapitalizedWords(record.totalPay)}
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <span className="text-red-500">—</span>
                                )}
                            </TableCell>

                            {/* === Payment Status (Tooltip if Paid) === */}
                            <TableCell>
                                {record.paidAt ? (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <span className="text-green-600 cursor-help">Paid</span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-sm">
                                            {formatDateWithFns(record.paidAt, { showTime: true })}
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <span className="text-red-500">Unpaid</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};