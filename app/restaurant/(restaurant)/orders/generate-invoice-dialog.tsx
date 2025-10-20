"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import z from "zod";
import { invoiceFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { InvoiceResponse, OrderItem } from "@/lib/definations";

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input"
import SelectInput from "@/components/ui/select-input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader } from "lucide-react";
import { formatDateWithFns } from "@/lib/date-fns";
import { Checkbox } from "@/components/ui/checkbox";

// --- Props Type ---
type GenerateInvoiceProps = {
  mode: 'create' | 'view';
  data: any; // contains all info (cart, invoice, order, booking, footer etc.)
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const GenerateInvoiceDialog = ({ mode, data, isOpen, setIsOpen }: GenerateInvoiceProps) => {

  // --- Destructure Incoming Data ---
  const { order, invoice, booking, footer, cart = [], invoiceId } = data || {};
  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceResponse | null>(null)
  const [invoicefetching, setInvoicefetching] = useState<boolean>(false)
  const [enablePrintOnSubmit, setEnablePrintOnSubmit] = useState<boolean>(true)
  const isViewMode = mode === "view";

  useEffect(() => {
    const API_URL = `/api/invoices/${invoiceId}`;

    async function fetchInvoice() {
      try {
        setInvoicefetching(true)
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        })
        const result = await response.json();
        setInvoiceDetail(result)

      } catch (e) {
        console.error("Unexpected error:", e)
        toast.error("An unexpected error occurred. Please try again later.")
      } finally {
        setInvoicefetching(false)
      }
    }

    if (invoiceId) {
      fetchInvoice()
    }

  }, [invoiceId])

  // --- Compute Menu Items Based on Mode ---
  const menuItems = mode === "view"
    ? (invoiceDetail?.items ?? []).map((item: OrderItem) => ({
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
        subtotal: parseFloat(invoiceDetail?.invoice?.subTotalAmount ?? "0"),
        discount: parseFloat(invoiceDetail?.invoice?.discount ?? "0"),
        total: parseFloat(invoiceDetail?.invoice?.totalAmount ?? "0"),
        advancePaid: parseFloat(invoiceDetail?.invoice?.advancePaid ?? "0"),
        grandTotal: parseFloat(invoiceDetail?.invoice?.grandTotal ?? "0"),
      }
      : footer;
  }, [mode, invoiceDetail, footer]);

  // --- Derive Defaults ---
  const customerName = mode === "view" ? invoiceDetail?.invoice.customerName : booking?.customerName ?? "";
  const selectedOrderType = invoiceDetail?.order?.orderType ?? order?.orderType ?? "takeaway";
  const isDineInHidden = (invoiceDetail?.order?.orderType ?? order?.orderType) === "dine_in";

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

  function generateSlipHTML(invoiceId?: number) {

    const displayInvoiceId = invoiceDetail?.invoice.id ?? invoiceId ?? "N/A";
    const slipHtml = `
      <html>
        <head>
          <title>Invoice Slip</title>
          <style>
            @page { size: 80mm auto; margin: 5mm; }
            body { font-family: monospace, monospace; font-size: 12px; padding: 10px; }
            h1, p { margin: 0; padding: 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border-bottom: 1px solid #ddd; padding: 5px 0; text-align: left; }
          </style>
        </head>
        <body style="font-family: monospace, monospace; font-size: 12px; padding: 10px;">

          <h1 style="margin: 0; padding-bottom: 5px;">Foodya Restaurant</h1>
          <p style="margin: 0 0 10px 0;">Find it, Eat it, Love it</p>

          <h2 style="margin: 0 0 5px 0;">Invoice #${displayInvoiceId}</h2>

          <p style="margin: 0 0 5px 0;">Customer: ${customerName ? customerName : "Random"}</p>
          <p style="margin: 0 0 5px 0;">Order Type: ${selectedOrderType ?? "N/A"}</p>
          <p style="margin: 0 0 5px 0;">Payment: ${invoiceDetail?.invoice.paymentMethod ?? form.getValues("paymentMethod") ?? "N/A"}</p>
          <p style="margin: 0 0 5px 0;">Order Date: ${formatDateWithFns(invoiceDetail?.order.createdAt || new Date()) ?? "N/A"}</p>
          <p style="margin: 0 0 5px 0;">Invoice Date: ${formatDateWithFns(invoiceDetail?.invoice.createdAt || new Date()) ?? "N/A"}</p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <thead>
              <tr>
                <th style="border-bottom: 1px solid #000; text-align: left;">Item</th>
                <th style="border-bottom: 1px solid #000; text-align: right;">Qty</th>
                <th style="border-bottom: 1px solid #000; text-align: right;">Price</th>
                <th style="border-bottom: 1px solid #000; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(menuItems ?? []).map((item: any) => `
                <tr>
                  <td style="padding: 4px 0;">${item.menuItemName} ${item.menuItemOptionName ? `(${item.menuItemOptionName})` : ""}</td>
                  <td style="padding: 4px 0; text-align: right;">${item.quantity}</td>
                  <td style="padding: 4px 0; text-align: right;">${parseFloat(item.price).toFixed(2)}</td>
                  <td style="padding: 4px 0; text-align: right;">${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <p style="margin: 0 0 5px 0;">Subtotal: ${invoiceFooter.subtotal ?? 0}</p>
          <p style="margin: 0 0 2px 0;">Discount: ${invoiceFooter.discount ?? 0}%</p>
          <p style="margin: 0 0 2px 0;">Total: ${Math.round(invoiceFooter.total).toFixed(2) ?? 0}</p>
          <p style="margin: 0 0 10px 0;">Advance Paid: ${invoiceFooter.advancePaid ?? 0}</p>

          <h4 style="margin: 0;">Grand Total: ${Math.round(invoiceFooter.grandTotal ?? 0).toFixed(2)} PKR</h4>

        </body>
      </html>
    `;

    return slipHtml;
  }

  function printSlip(invoiceId?: number) {
    const slipHTML = generateSlipHTML(invoiceId);

    const printWindow = window.open("", "PrintWindow", "width=900,height=600");
    if (!printWindow) return;

    printWindow.document.write(slipHTML);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }

  /* === Submit Handler === */
  async function onSubmit(values: z.infer<typeof invoiceFormSchema>) {

    if (isViewMode) {
      printSlip();
      return;
    }

    const API_URL = "/api/invoices";
    let payload;

    // --- Case: Drive Thru / Takeaway ---
    if (order?.orderType !== 'dine_in') {
      payload = {
        order: {
          orderType: values.orderType,
          paymentMethod: values.paymentMethod,
          isPaid: true,
          customerName: values.customerName,
          subTotalAmount: values.subTotalAmount,
          discount: values.discount,
          totalAmount: Math.round(Number(values.totalAmount)).toFixed(2),
          grandTotal: Math.round(Number(values.grandTotal)).toFixed(2),
        },
        items: menuItems
      };
    } else {
      // --- Case: Dine In ---

      payload = {
        invoice: {
          orderId: order.id,
          tableId: order.tableId,
          isPaid: true,
          generatedByUserId: order.waiterId,
          orderType: order.orderType,
          subTotalAmount: values.subTotalAmount,
          discount: values.discount,
          totalAmount: Math.round(Number(values.totalAmount)).toFixed(2),
          advancePaid: values.advancePaid,
          grandTotal: Math.round(Number(values.grandTotal)).toFixed(2),
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


      if (enablePrintOnSubmit) {
        printSlip(result.invoiceId);
      }

      setIsOpen(false);

    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred. Please try again later.")
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:min-w-6/7 md:min-w-2.5/3 max-h-[calc(100vh-2rem)] min-w-1/2 min-h-1/2 lg:min-w-fit font-rubik-400">

        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {mode === 'create'
              ? "Generate Invoice"
              : <>Invoice <span className="text-orange-500">#{invoiceDetail?.invoice.id}</span></>
            }
          </DialogTitle>
          <DialogDescription className="sr-only">
            Click on &apos;Confirm & Print&apos; to generate the invoice for the order.
          </DialogDescription>
        </DialogHeader>

        {invoicefetching ? (
          // Show loader while invoice is fetching
          <div className="flex h-full w-full justify-center items-center">
            <Loader className="animate-spin size-7 text-gray-500" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              <div className={`w-full grid gap-4 text-sm items-start ${mode === 'view' ? 'grid-cols-2' : 'grid-cols-1'}`}>

                {/* --- Customer Input Field --- */}
                <div className="w-full">
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
                            readOnly={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* --- Order Type Select Field --- */}
                <div className="w-full">
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
                            disabled={!!order?.orderType || isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>


                {/* --- Payment Select Field --- */}
                <div className="w-full">
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
                            disabled={isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* --- Paid Status --- */}
                {invoiceDetail?.invoice && <div className="flex w-full flex-row text-neutral-500 justify-start">
                  <p className="text-black mr-2">Paid: </p>
                  <p>{invoiceDetail?.invoice.isPaid ? 'Paid' : 'Unpaid'}</p>
                </div>
                }

                {/* --- Order Create Date --- */}
                {invoiceDetail?.order.createdAt && <div className="flex w-full flex-row text-neutral-500 justify-start">
                  <p className="text-black mr-2">Order Date: </p>
                  <p>{formatDateWithFns(invoiceDetail?.order.createdAt, { showTime: true })}</p>
                </div>
                }

                {/* --- Invoice Create Date --- */}
                {invoiceDetail?.invoice.createdAt && <div className="flex w-full flex-row text-neutral-500 justify-start">
                  <p className="text-black mr-2">Invoice Date: </p>
                  <p>{formatDateWithFns(invoiceDetail?.invoice.createdAt, { showTime: true })}</p>
                </div>
                }

                {/* --- Invoice Create By User --- */}
                {invoiceDetail?.invoice?.generatedByUserId && <div className="flex flex-row w-full col-span-2 text-neutral-500 justify-start">
                  <p className="text-black mr-2">Invoiced by: </p>
                  <p>{invoiceDetail?.generatedBy?.name}</p>
                </div>
                }

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
                        <TableCell>{(parseFloat(product.price) * product.quantity).toFixed(2)}</TableCell>
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
              <DialogFooter className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2'>
                {!isViewMode && <div hidden={isViewMode} className="flex items-center space-x-2">
                  <Checkbox
                    id="enableAutoPrint"
                    checked={enablePrintOnSubmit}
                    disabled={isViewMode}
                    onCheckedChange={(checked) => {
                      if (checked === "indeterminate") {
                        setEnablePrintOnSubmit(false);
                      } else {
                        setEnablePrintOnSubmit(checked);
                      }
                    }}
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 dark:text-foreground"
                  />
                  <label htmlFor="enableAutoPrint" className="select-none text-sm">
                    Auto print on submit
                  </label>
                </div>}
                <div className="flex w-full ml-auto sm:w-auto gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" onClick={() => setIsOpen(false)} className="w-1/2 sm:w-auto">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" className="w-1/2 min-w-20 sm:w-auto" variant={'green'}>{isViewMode ? 'Print' : 'Confirm & Print'}</Button>
                </div>
              </DialogFooter>

            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default GenerateInvoiceDialog