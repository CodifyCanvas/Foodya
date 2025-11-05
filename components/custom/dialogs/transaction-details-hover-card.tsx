'use client';

import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmployeePayrollInterface, InvoiceResponse, OrderItem, TransactionsTablesInterface } from '@/lib/definations';
import { formatDateWithFns } from '@/lib/date-fns';
import { formatMonthYear } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { HoverTransactionCardSkeleton } from '@/components/fallbacks/skeletons';

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
            <div className="font-rubik bg-card text-card-foreground shadow-sm rounded-lg overflow-hidden max-w-sm">
                <div className="p-4">
                    <div className="bg-muted/30 rounded-md p-3.5">
                        <p className="text-xs text-center md:text-sm text-foreground/90 leading-relaxed">
                            {description || 'No description provided.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <HoverTransactionCardSkeleton />
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
        const generatedBy = invoiceData.generatedBy;
        const order = invoiceData.order;

        return (
            <div className="font-rubik bg-card text-card-foreground shadow-sm rounded-lg overflow-hidden max-w-sm">
                {/* Compact Header */}
                <div className="bg-primary text-primary-foreground px-6 py-4 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">Invoice #{invoice.id || 'N/A'}</h3>
                        {/* invoice.paymentMethod?.toLowerCase() */}
                        <Badge className={`font-semibold uppercase ${invoice.paymentMethod?.toLowerCase() === 'cash'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/75 dark:text-green-300'
                            : invoice.paymentMethod?.toLowerCase() === 'card'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/75 dark:text-yellow-300'
                                : 'bg-indigo-100 text-indigo-500 dark:bg-indigo-900/75 dark:text-indigo-300'
                            }`}>
                            {invoice.paymentMethod}
                        </Badge>
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    {/* Quick Info */}
                    <div className="flex justify-between items-start text-xs">
                        <div>
                            <p className="text-muted-foreground text-[0.7rem] md:text-xs uppercase">Customer</p>
                            <p className="font-semibold text-xs md:text-sm capitalize mt-0.5">{invoice.customerName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground text-[0.7rem] md:text-xs uppercase">Order Type</p>
                            <p className="font-semibold text-xs md:text-sm capitalize mt-0.5">{order.orderType?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                        </div>
                    </div>

                    {/* Items Preview */}
                    <div className="bg-muted/30 rounded-md p-2.5">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-muted-foreground font-medium">Items</span>
                            <span className="text-[0.7rem] md:text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                {items?.length || 0} items
                            </span>
                        </div>
                        <div className="space-y-1.5 max-h-24 overflow-y-auto scroll-bar pr-2">
                            {items?.map((item: OrderItem) => (
                                <div key={item.id} className="flex justify-between text-xs md:text-sm">
                                    <span className="text-foreground truncate mr-2">
                                        {item.quantity}x {item.menuItemName}
                                        {item.menuItemOptionName && <span className="text-muted-foreground text-[0.7rem] md:text-xs"> ({item.menuItemOptionName})</span>}
                                    </span>
                                    <span className="font-medium whitespace-nowrap">
                                        Rs. {(parseFloat(item.price) * item.quantity).toFixed(0)}
                                    </span>
                                </div>
                            ))}
                            {/* {items?.length > 3 && (
                                <p className="text-[10px] text-muted-foreground italic text-center pt-1">
                                    +{items.length - 3} more items...
                                </p>
                            )} */}
                        </div>
                    </div>

                    {/* Totals Summary - Compact */}
                    <div className="space-y-1.5 text-xs md:text-sm pt-2 border-t border-border/50">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>Rs. {parseFloat(invoice.subTotalAmount).toFixed(0)}</span>
                        </div>
                        {Number(invoice.discount) > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Discount ({invoice.discount}%)</span>
                                <span className="text-green-600 dark:text-green-500">
                                    - Rs. {(parseFloat(invoice.subTotalAmount) - parseFloat(invoice.totalAmount)).toFixed(0)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Grand Total - Highlighted */}
                    <div className="bg-primary/10 dark:bg-primary/20 rounded-md p-2.5 flex justify-between items-center">
                        <span className="font-bold text-xs md:text-sm">Grand Total</span>
                        <span className="font-bold text-sm md:text-base text-primary">
                            Rs. {parseFloat(invoice.grandTotal).toLocaleString()}
                        </span>
                    </div>

                    {/* Footer */}
                    {generatedBy?.name && (
                        <div className="text-xs font-mono text-muted-foreground capitalize text-center pt-1">
                            Invoiced By: {generatedBy.name}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // === Handle Payroll ===
    if (sourceType === 'payroll' && (data as EmployeePayrollInterface)?.id) {
        const payroll = data as EmployeePayrollInterface;

        return (
            <div className="font-rubik space-y-6 bg-card text-card-foreground shadow-sm">
                {/* Header Section */}
                <div className="bg-primary text-primary-foreground px-6 py-4 rounded-t-lg">
                    <h3 className="text-xl font-bold text-center">Payroll Slip</h3>
                    <p className="text-center text-sm opacity-90 mt-1">
                        {formatMonthYear(payroll.month)}
                    </p>
                </div>

                <div className="px-6 pb-4 space-y-5">
                    {/* Employee Information Card */}
                    <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                        Employee Details
                    </h4>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2.5">
                        {payroll.employeeId ? (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Employee ID:</span>
                                <span className="font-medium">#{payroll.employeeId}</span>
                            </div>
                        ) : (
                            <div className="text-destructive text-sm font-medium">
                                ⚠ Employee unavailable
                            </div>
                        )}
                        <div className="flex justify-between capitalize text-sm">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{payroll.employeeName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium">{payroll.employeeEmail}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">CNIC:</span>
                            <span className="font-medium">{payroll.employeeCNIC}</span>
                        </div>
                    </div>

                    {/* Payroll Breakdown Card */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                            Salary Breakdown
                        </h4>
                        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Basic Pay</span>
                                <span className="font-semibold">Rs. {payroll.basicPay.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Bonus</span>
                                <span className="font-semibold text-green-600 dark:text-green-500">
                                    + Rs. {payroll.bonus.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Penalty</span>
                                <span className="font-semibold text-red-600 dark:text-red-500">
                                    - Rs. {payroll.penalty.toLocaleString()}
                                </span>
                            </div>

                            {/* Total Pay - Highlighted */}
                            <div className="border-t border-border pt-3 mt-3">
                                <div className="flex justify-between items-center bg-primary/10 dark:bg-primary/20 rounded-md p-3">
                                    <span className="font-bold text-sm md:text-base">Net Pay</span>
                                    <span className="font-bold text-base md:text-lg text-primary">
                                        Rs. {payroll.totalPay.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status and Payment Info */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${payroll.status === 'paid'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}>
                                {payroll.status}
                            </span>
                        </div>
                        {payroll.paidAt && (
                            <div className="text-xs text-muted-foreground">
                                Paid: {formatDateWithFns(payroll.paidAt, { showTime: true, separator: '/', showSeconds: true })}
                            </div>
                        )}
                    </div>

                    {/* Description/Notes */}
                    {payroll.description && (
                        <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                                Note
                            </p>
                            <p className="text-sm text-foreground italic">
                                {payroll.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return <div className="text-sm text-muted-foreground">No additional data available.</div>;
};

export default TransactionDetailsHoverCard;
