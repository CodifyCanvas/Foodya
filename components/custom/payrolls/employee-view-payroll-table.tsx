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
                    <TableRow className="bg-accent/50 text-neutral-500 hover:bg-white sticky top-0 uppercase text-xs font-sans font-extrabold [&>*]:whitespace-nowrap">
                        <TableHead className="pl-4 text-neutral-500 font-bold">S.No</TableHead>
                        <TableHead className="text-neutral-500 font-bold">Month</TableHead>
                        <TableHead className="text-neutral-500 font-bold">Basic Pay</TableHead>
                        <TableHead className="text-neutral-500 font-bold">Bonus</TableHead>
                        <TableHead className="text-neutral-500 font-bold">Penalty</TableHead>
                        <TableHead className="text-neutral-500 font-bold">Total</TableHead>
                        <TableHead className="text-neutral-500 font-bold">Status</TableHead>
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
                                    <span className="text-destructive">—</span>
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
                                    <span className="text-destructive">Unpaid</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};