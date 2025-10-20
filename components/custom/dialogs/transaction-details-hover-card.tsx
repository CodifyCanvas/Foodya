'use client';

import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmployeePayrollInterface, InvoiceResponse, OrderItem, TransactionsTablesInterface } from '@/lib/definations';
import { formatDateWithFns } from '@/lib/date-fns';
import { formatMonthYear } from '@/lib/utils';

interface Props {
    row: TransactionsTablesInterface;
}

export const TransactionDetailsHoverCard = ({ row }: Props) => {
    const { sourceType, sourceId, description } = row;
    const [data, setData] = useState<InvoiceResponse | EmployeePayrollInterface | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const shouldFetch = sourceType === 'invoice' || sourceType === 'payroll';

    useEffect(() => {
        if (!shouldFetch || !sourceId) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`/api/${sourceType === 'invoice' ? 'invoices' : 'payrolls/details'}/${sourceId}`);
                if (!res.ok) throw new Error('Failed to fetch details');
                const json = await res.json();
                setData(json);
            } catch (e) {
                setError('Error fetching details');
                console.error('Failed to fetch the Hover Card Data: ', e)
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sourceType, sourceId, shouldFetch]);

    if (!shouldFetch || !sourceId) {
        return (
            <div className="text-sm text-muted-foreground max-w-xs">
                {description || 'No description provided.'}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
            </div>
        );
    }

    if (error) {
        return <div className="text-sm text-red-500">{error}</div>;
    }

    // === Handle Invoice ===
    if (sourceType === 'invoice' && (data as InvoiceResponse)?.invoice) {
        const invoiceData = data as InvoiceResponse;
        const invoice = invoiceData.invoice;
        const items = invoiceData.items;
        const generatedBy = invoiceData.generatedBy; // if exists
        const order = invoiceData.order; // if exists

        return (
            <div className="space-y-2 text-sm">
                <div className='capitalize'>
                    <strong>Customer:</strong> {invoice.customerName}
                </div>
                <div className='capitalize'>
                    <strong>Payment:</strong> {invoice.paymentMethod}
                </div>
                <div className='capitalize'>
                    <strong>Order Type:</strong> {order.orderType}
                </div>

                <div className="grid w-full border-b rounded">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-white sticky top-0 uppercase font-bold text-xs text-neutral-500">
                                <TableHead className="pl-4">S.No</TableHead>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Price (PKR)</TableHead>
                                <TableHead>Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items?.map((item: OrderItem, index: number) => (
                                <TableRow key={item.id} className="h-10 text-sm">
                                    <TableCell className="pl-4">{String(index + 1).padStart(2, '0')}</TableCell>
                                    <TableCell>
                                        {item.menuItemName}
                                        {item.menuItemOptionName && (
                                            <span className="text-xs text-muted-foreground"> ({item.menuItemOptionName})</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.price}</TableCell>
                                    <TableCell>{(parseFloat(item.price) * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* --- Invoice Totals Summary --- */}
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex flex-row justify-between">
                        <p>Subtotal</p>
                        <p>{invoice.subTotalAmount}</p>
                    </div>
                    <div className="flex flex-row justify-between">
                        <p>Dis %</p>
                        <p>{invoice.discount}%</p>
                    </div>
                    <div className="flex flex-row justify-between">
                        <p>Total</p>
                        <p>{invoice.totalAmount}</p>
                    </div>
                    <div className="flex flex-row font-semibold justify-between">
                        <p>Grand Total</p>
                        <p className="text-orange-500">
                            {invoice.grandTotal} PKR
                        </p>
                    </div>
                </div>

                {generatedBy?.name && <div className="text-xs text-muted-foreground mt-1">
                    Generated by: {generatedBy?.name}
                </div>}
            </div>
        );
    }

    // === Handle Payroll ===
    if (sourceType === 'payroll' && (data as EmployeePayrollInterface)?.id) {
        const payroll = data as EmployeePayrollInterface;

        return (
            <div className="text-sm font-rubik space-y-4">
                {/* Header */}
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Payroll Slip</h3>
                    <p className="text-muted-foreground text-sm">Month: {formatMonthYear(payroll.month)}</p>
                </div>

                {/* Employee Info */}
                <div className="grid grid-cols-1 gap-2 text-sm">
                    {payroll.employeeId
                        ? <div><strong>Employee ID:</strong> #{payroll.employeeId}</div>
                        : <div className='text-red-600'><strong>Employee record not found or has been deleted.</strong></div>}
                    <div><strong>Employee Name:</strong> {payroll.employeeName}</div>
                    <div><strong>Email:</strong> {payroll.employeeEmail}</div>
                    <div><strong>CNIC:</strong> {payroll.employeeCNIC}</div>
                </div>

                {/* Payroll Breakdown */}
                <div className="border-t border-b py-2 text-sm space-y-2">
                    <div className="flex justify-between">
                        <span>Basic Pay:</span>
                        <span>Rs. {payroll.basicPay}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Bonus:</span>
                        <span>Rs. {payroll.bonus}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Penalty:</span>
                        <span>Rs. {payroll.penalty}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total Pay:</span>
                        <span>Rs. {payroll.totalPay}</span>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="flex flex-col justify-between capitalize items-center text-sm">
                    <span><strong>Status:</strong> <span className={payroll.status === 'paid' ? 'text-green-600' : 'text-red-600'}>{payroll.status}</span></span>
                    {payroll.paidAt && (
                        <span className="text-sm text-neutral-700">
                            Paid on: {formatDateWithFns(payroll.paidAt, { showTime: true, separator: '/', showSeconds: true })}
                        </span>
                    )}
                </div>

                {/* Optional Description */}
                {payroll.description && (
                    <div className="text-xs text-muted-foreground italic">
                        Note: {payroll.description}
                    </div>
                )}
            </div>
        );
    }

    return <div className="text-sm text-muted-foreground">No additional data available.</div>;
};

export default TransactionDetailsHoverCard;
