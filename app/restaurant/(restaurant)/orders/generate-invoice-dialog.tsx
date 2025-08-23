"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import z from "zod";
import { invoiceFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { OrderItem } from "@/lib/definations";

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input"
import SelectInput from "@/components/ui/select-input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// --- Props Type ---
type GenerateInvoiceProps = {
  disabled: boolean;
  mode: 'create' | 'view';
  data: any; // contains all info (cart, invoice, order, booking, footer etc.)
};

const GenerateInvoiceDialog = ({ disabled, mode, data }: GenerateInvoiceProps) => {

  // --- Destructure Incoming Data ---
  const { order, invoice, booking, items = [], footer, cart = [] } = data || {};

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // --- Compute Menu Items Based on Mode ---
  const menuItems = mode === "view"
    ? items.map((item: OrderItem) => ({
      menuItemImage: item.menuItemImage ?? "",
      menuItemId: item.menuItemId ?? 0,
      menuItemName: item.menuItemName,
      menuItemOptionId: item.menuItemOptionId ?? null,
      menuItemOptionName: item.menuItemOptionName ?? "",
      quantity: item.quantity,
      price: parseFloat(item.price),
    }))
    : cart;

  // --- Compute Invoice Footer Totals ---
  const invoiceFooter = useMemo(() => {
    return mode === "view"
      ? {
        subtotal: parseFloat(invoice?.invoice?.subTotalAmount ?? "0"),
        discount: parseFloat(invoice?.invoice?.discount ?? "0"),
        total: parseFloat(invoice?.invoice?.totalAmount ?? "0"),
        advancePaid: parseFloat(invoice?.invoice?.advancePaid ?? "0"),
        grandTotal: parseFloat(invoice?.invoice?.grandTotal ?? "0"),
      }
      : footer;
  }, [mode, invoice, footer]);

  // --- Derive Defaults ---
  const customerName = mode === "view" ? invoice?.customerName : booking?.customerName ?? "";
  const selectedOrderType = invoice?.order?.orderType ?? order?.orderType ?? "takeaway";
  const isDineInHidden = (invoice?.order?.orderType ?? order?.orderType) === "dine_in";

  // --- React Hook Form Setup ---
  const form = useForm<z.infer<typeof invoiceFormSchema>>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerName: "",
      paymentMethod: "cash",
      orderType: "takeaway",
      subTotalAmount: "0.00",
      discount: "0.00",
      totalAmount: "0.00",
      advancePaid: "0.00",
      grandTotal: "0.00",
    },
  });

  // --- Reset Form When Dialog Opens ---
  useEffect(() => {
    form.reset({
      customerName: customerName ?? "",
      paymentMethod: invoice?.paymentMethod ?? "cash",
      orderType: selectedOrderType,
      subTotalAmount: invoiceFooter?.subtotal?.toFixed(2) ?? "0.00",
      discount: invoiceFooter?.discount?.toFixed(2) ?? "0.00",
      totalAmount: invoiceFooter?.total?.toFixed(2) ?? "0.00",
      advancePaid: invoiceFooter?.advancePaid?.toFixed(2) ?? "0.00",
      grandTotal: Math.max(Number(invoiceFooter?.grandTotal) || 0, 0).toFixed(2),
    });
  }, [selectedOrderType, invoice, invoiceFooter, customerName, form]);

  /* === Submit Handler === */
  async function onSubmit(values: z.infer<typeof invoiceFormSchema>) {
    const API_URL = "/api/invoices";
    let payload;

    // --- Case: Drive Thru / Takeaway ---
    if (order?.orderType !== 'dine_in') {
      payload = {
        order: {
          orderType: values.orderType,
          paymentMethod: values.paymentMethod,
          customerName: values.customerName,
          subTotalAmount: values.subTotalAmount,
          discount: values.discount,
          totalAmount: values.totalAmount,
          grandTotal: values.grandTotal,
        },
        items: menuItems
      };
    } else {
      // --- Case: Dine In ---

      payload = {
        invoice: {
          orderId: order.id,
          tableId: order.tableId,
          generatedByUserId: order.waiterId,
          orderType: order.orderType,
          subTotalAmount: values.subTotalAmount,
          discount: values.discount,
          totalAmount: values.totalAmount,
          advancePaid: values.advancePaid,
          grandTotal: values.grandTotal,
          paymentMethod: values.paymentMethod,
          customerName: booking?.customerName ?? values.customerName ?? "random",
        },
        items: menuItems,
      };
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }

    try {
      const response = await fetch(API_URL, requestOptions)
      const result = await response.json()

      {/* === Show warning toast for duplicate/409 error === */ }
      if (result.status === 409) {
        toast.error(result?.message ?? "Duplicate value found.");
        return;
      }

      if (!response.ok) {
        toast.error(result?.message ?? ("Invoice can't be created. Please try again."))
        return
      }

      toast.success(result?.message ?? ("New Invoice created successfully."))

      // Reset form only after successful create
      form.reset()
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred. Please try again later.")
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <form>
        <DialogTrigger asChild>
          <Button variant="secondary" onClick={() => setIsDialogOpen(true)} disabled={disabled} className='min-w-1/3 cursor-pointer'>
            {mode == 'create' ? 'Generate Invoice' : 'View Invoice'}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:min-w-6/7 md:min-w-2.5/3 max-h-[calc(100vh-2rem)] lg:min-w-fit font-rubik-400">

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              <DialogHeader>
                <DialogTitle className="text-lg font-medium">{mode == 'create' ? `Generate Invoice` : `Invoice`}</DialogTitle>
                <DialogDescription className="sr-only">
                  Click on &apos;Confirm & Print&apos; to generate the invoice for the order.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-2 text-sm">

                {/* --- Customer Input Field --- */}
                <div className="flex flex-row items-center gap-2">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem className="flex flex-row">
                        <FormLabel className="font-normal">
                          Customer Name:
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Random"
                            {...field}
                            className="w-fit h-10 border-b text-neutral-500"
                            variant="minimal"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* --- Payment Select Field --- */}
                <div className="flex flex-row items-center gap-2">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="flex flex-row">
                        <FormLabel className="font-normal">
                          Payment:
                        </FormLabel>
                        <FormControl>
                          <SelectInput options={[
                            { label: 'Cash', value: 'cash' },
                            { label: 'Card', value: 'card' },
                            { label: 'Online', value: 'online' }
                          ]}
                            value={field.value ?? ""}
                            className="w-fit border-0 border-b border-gray-300 rounded-none shadow-none focus:ring-0 focus:border-neutral-500"
                            onChange={field.onChange}
                            placeholder="Cash, Cred..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* --- Order Type Select Field --- */}
                <div className="flex flex-row items-center gap-2">
                  <FormField
                    control={form.control}
                    name="orderType"
                    render={({ field }) => (
                      <FormItem className="flex flex-row">
                        <FormLabel className="font-normal">
                          Order Type:
                        </FormLabel>
                        <FormControl>
                          <SelectInput options={[
                            { label: 'Drive Thru', value: 'drive_thru' },
                            { label: 'Take Away', value: 'takeaway' },
                            { label: 'Dine In', value: 'dine_in', optDisabled: !isDineInHidden, optHide: !isDineInHidden }
                          ]}
                            value={field.value ?? ""}
                            className="w-fit border-0 border-b border-gray-300 rounded-none shadow-none focus:ring-0 focus:border-neutral-500"
                            onChange={field.onChange}
                            placeholder="Drive Thru, ..."
                            disabled={!!order?.orderType}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* --- Items Table --- */}
              <div className="grid w-full [&>div]:max-h-[40vh] border-b [&>div]:rounded">
                <Table>
                  <TableHeader>
                    <TableRow className="[&>*]:whitespace-nowrap  bg-white hover:bg-white sticky top-0 uppercase text-xs after:content-[''] after:inset-x-0 after:h-px after:absolute after:bottom-0">
                      <TableHead className="pl-4 min-w-auto sm:min-w-20 text-neutral-500">S.No</TableHead>
                      <TableHead className="min-w-auto sm:min-w-56 text-neutral-500">Item Name</TableHead>
                      <TableHead className="min-w-auto sm:min-w-20 text-neutral-500">Qty</TableHead>
                      <TableHead className="min-w-auto sm:min-w-20 text-neutral-500">Price (PKR)</TableHead>
                      <TableHead className="min-w-auto sm:min-w-20 text-neutral-500">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="overflow-hidden">
                    {menuItems.map((product: OrderItem, index: number) => (
                      <TableRow
                        key={index}
                        className="[&>*]:whitespace-nowrap h-10 font-rubik-400"
                      >
                        <TableCell className="pl-4">{index + 1}</TableCell>
                        <TableCell>{product.menuItemName} <span className="text-xs">{product.menuItemOptionName && `(${product.menuItemOptionName})`}</span></TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell>{parseFloat(product.price) * product.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* --- Invoice Totals Summary --- */}
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex flex-row text-neutral-500 justify-between">
                  <p>Subtotal</p>
                  <p>{invoiceFooter.subtotal.toFixed(2)}</p>
                </div>
                <div className="flex flex-row text-neutral-500 justify-between">
                  <p>Discount %</p>
                  <p>{invoiceFooter.discount}%</p>
                </div>
                <div className="flex flex-row text-neutral-500 justify-between">
                  <p>Total</p>
                  <p>{invoiceFooter.total.toFixed(2)}</p>
                </div>
                {booking && <div className="flex flex-row text-neutral-500 justify-between">
                  <p>Arrears</p>
                  <p>{booking.advancePaid}</p>
                </div>
                }
                <div className="flex flex-row justify-between">
                  <p>Grand Total</p>
                  <p className="text-orange-500">
                    {Math.max(Math.round(invoiceFooter.grandTotal.toFixed(2)), 0)} PKR
                  </p>
                </div>

                {/* --- Overpayment Notice --- */}
                {booking && invoiceFooter?.grandTotal < 0 && (
                  <p className="text-orange-500 text-sm">
                    You&apos;ve overpaid by <strong>{Math.abs(invoiceFooter.grandTotal).toFixed(2)} PKR</strong>. We&apos;ll refund the extra.
                  </p>
                )}

              </div>

              {/* --- Dialog Actions --- */}
              <DialogFooter className="flex-row gap-2">
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="w-1/2 sm:w-auto">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="w-1/2 sm:w-auto" variant={'green'}>Confirm & Print</Button>
              </DialogFooter>

            </form>
          </Form>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default GenerateInvoiceDialog