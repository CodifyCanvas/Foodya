"use client"

import { useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import { invoiceActionFormSchema } from "@/lib/zod-schema/restaurant.zod"

import toast from 'react-hot-toast'
import { refreshData } from "@/lib/swr"
import SelectInput from "@/components/ui/select-input"
import { DateInput } from "@/components/custom/date-picker"
import SwitchInput from "@/components/ui/switch-input"
import { Loader, Plus } from "lucide-react"
import { DynamicOrderItemRow } from './dynamic-order-item-row'
import { GeneratedBy, InvoiceDetail, InvoiceResponse } from "@/lib/definations"

/* === Props Interface === */
interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: { invoiceId: string | number } | null
  [key: string]: any
}

// interface Order {
//   id: number;
//   tableId: string;
//   orderType: "dine_in" | "drive_thru" | "takeaway";
//   status: string;
//   description: string | null;
//   createdAt: string; // ISO date string
// }

// interface Item {
//   id: number;
//   menuItemImage: string | null;
//   orderId: number;
//   menuItemId: string;
//   menuItemName: string;
//   menuItemOptionId: string | null;
//   menuItemOptionName: string | null;
//   quantity: number;
//   price: string;
// }

// export interface InvoiceOrderItem {
//   invoice: InvoiceDetail;
//   order: Order;
//   items: Item[];
//   generatedBy: GeneratedBy;
// }

export function RoleForm({ open, onOpenChange, data: dataProp, menuItems = [], tables = [] }: FormDialogProps) {
  /* === Local State === */
  const [manualReset, setManualReset] = useState(false)
  const [data, setData] = useState<InvoiceResponse | null>(null)
  const [submitButtonLoading, setSubmitButtonLoading] = useState<boolean>(false)
  const [invoiceFetching, setInvoiceFetching] = useState<boolean>(false)
  const invoiceIdProp = dataProp?.invoiceId ?? 0;

  /* === React Hook Form Setup === */
  type InvoiceFormValues = z.infer<typeof invoiceActionFormSchema>;
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceActionFormSchema) as any,
    defaultValues: {
      invoiceId: 0,
      customerName: "",
      paymentMethod: null,
      isPaid: false,
      invoiceCreatedAt: new Date(),

      orderId: 0,
      tableId: "",
      orderType: "takeaway",
      orderCreatedAt: new Date(),

      orderItems: [{
        menuItemImage: null,
        menuItemId: "",
        menuItemName: "",
        menuItemOptionId: null,
        menuItemOptionName: null,
        quantity: 1,
        price: "0",
      }],

      subTotalAmount: "0",
      discount: "0",
      totalAmount: "0",
      advancePaid: "0",
      grandTotal: "0",
    },
  })

  const { control, watch, setValue, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "orderItems"
  });

  const isPaidVar = watch("isPaid");
  const isDineInVar = watch("orderType") === 'dine_in';

  useEffect(() => {
    if (!dataProp?.invoiceId) return;

    setInvoiceFetching(true);

    async function fetchInvoice() {
      try {
        toast.loading("Fetching Invoice...", {
          id: 'fetching-invoice-toast'
        })

        const response = await fetch(`/api/invoices/${dataProp?.invoiceId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        setData(result);
      } catch (e) {
        console.error("Failed to fetch invoice:", e);
        toast.error(`Failed to fetch Invoice #${dataProp?.invoiceId}`)
      } finally {
        toast.dismiss("fetching-invoice-toast")
        setInvoiceFetching(false);
      }
    }

    fetchInvoice();
  }, [dataProp]);

  /* === Load Initial Values When Editing === */
  useEffect(() => {
    if (!manualReset && data) {
      form.reset({
        invoiceId: invoiceIdProp,
        customerName: data?.invoice.customerName ?? "",
        paymentMethod: data.invoice.paymentMethod === 'unpaid' ? null : data.invoice.paymentMethod,
        isPaid: data.invoice.isPaid ?? false,
        invoiceCreatedAt: data.invoice.createdAt ? new Date(data.invoice.createdAt) : new Date(),

        orderId: data.order.id ?? 0,
        tableId: data.order.tableId ?? "",
        orderType: data.order.orderType ?? "takeaway",
        orderCreatedAt: new Date(data.order.createdAt) ?? new Date(),

        orderItems: data.items?.map(opt => ({
          menuItemImage: opt.menuItemImage ?? null,
          menuItemId: String(opt.menuItemId ?? ""),
          menuItemName: opt.menuItemName ?? "",
          menuItemOptionId: opt.menuItemOptionId !== null && opt.menuItemOptionId !== undefined ? String(opt.menuItemOptionId) : null, // Ensure it's never undefined
          menuItemOptionName: opt.menuItemOptionName !== null && opt.menuItemOptionName !== undefined ? String(opt.menuItemOptionName) : null,
          quantity: opt.quantity ?? 1,
          price: opt.price ?? "0",
        })) ?? [{
          menuItemImage: null,
          menuItemId: "",
          menuItemName: "",
          menuItemOptionId: null,
          menuItemOptionName: null,
          quantity: 1,
          price: "0"
        }],

        subTotalAmount: data.invoice.subTotalAmount ?? "0",
        discount: data.invoice.discount ?? "0",
        totalAmount: data.invoice.totalAmount ?? "0",
        advancePaid: data.invoice.advancePaid ?? "0",
        grandTotal: data.invoice.grandTotal ?? "0",
      })
    }
  }, [data, manualReset, form, invoiceIdProp])

  /* === Make Calculations === */
  useEffect(() => {
    const subscription = watch((values) => {
      const items = values.orderItems ?? [];
      const discount = parseFloat(values.discount ?? "0") || 0;
      const advancePaid = parseFloat(values.advancePaid ?? "0") || 0;

      const subTotal = items.reduce((acc, item) => {
        const qty = Number(item?.quantity) || 0;
        const price = Number(item?.price) || 0;
        return acc + qty * price;
      }, 0);

      const totalAfterDiscount = subTotal - (subTotal * (discount / 100));
      const grandTotal = Math.max(0, totalAfterDiscount - advancePaid);

      // Only update if values have changed
      if (values.subTotalAmount !== subTotal.toFixed(2)) {
        setValue("subTotalAmount", subTotal.toFixed(2));
      }

      if (values.totalAmount !== totalAfterDiscount.toFixed(2)) {
        setValue("totalAmount", totalAfterDiscount.toFixed(2));
      }

      if (values.grandTotal !== grandTotal.toFixed(2)) {
        setValue("grandTotal", grandTotal.toFixed(2));
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  /* === Submit Handler === */
  async function onSubmit(formValues: InvoiceFormValues) {
    const isEditing = !!invoiceIdProp;
    const API_URL = isEditing ? "/api/invoices/update" : "/api/invoices/create";

    const requestOptions = {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formValues),
    }

    try {
      setSubmitButtonLoading(true)

      const response = await fetch(API_URL, requestOptions)
      const result = await response.json()

      {/* === Show warning toast for duplicate/409 error === */ }
      if (result.status === 409) {
        toast.error(result?.message ?? "Duplicate value found.");
        return;
      }

      if (!response.ok) {
        toast.error(result?.message ?? (isEditing
          ? "Invoice can't be updated. Please try again."
          : "Invoice can't be created. Please try again."))
        return
      }

      toast.success(result?.message ?? (isEditing
        ? "Invoice updated successfully."
        : "New Invoice created successfully."))

      // Reset form only after successfull create
      if (!isEditing) {
        form.reset()
      }

      refreshData('/api/invoices')
      onOpenChange(false)
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred. Please try again later.")
    } finally {
      setSubmitButtonLoading(false)
    }
  }

  /* === Reset Handler === */
  const ResetForm = () => {
    setManualReset(true)
    form.reset({
      invoiceId: dataProp?.invoiceId ?? 0,
      customerName: "",
      paymentMethod: null,
      isPaid: false,
      invoiceCreatedAt: new Date(),

      orderId: 0,
      tableId: "",
      orderType: "takeaway",
      orderCreatedAt: new Date(),

      orderItems: [{
        menuItemImage: null,
        menuItemId: "",
        menuItemName: "",
        menuItemOptionId: null,
        menuItemOptionName: null,
        quantity: 1,
        price: "0"
      }],

      subTotalAmount: "0",
      discount: "0",
      totalAmount: "0",
      advancePaid: "0",
      grandTotal: "0",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0" variant="full-screen">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-[calc(100vh-1rem)] grid grid-rows-[auto_1fr_auto]">

            {/* === Dialog Header === */}
            <DialogHeader className="p-3 pb-0">
              <DialogTitle>{dataProp?.invoiceId ? <p>Edit Invoice <span className="text-orange-500">#{dataProp?.invoiceId}</span></p> : "Create Invoice"}</DialogTitle>
              <DialogDescription className="sr-only">
                Create or Update your Invoice
              </DialogDescription>
            </DialogHeader>

            {/* === Scrollable Form Area === */}
            {invoiceFetching
              ? <div className="h-1/2 w-full bg-white flex justify-center items-center">
                <Loader className="animate-spin size-5 md:size-8 text-gray-500" />
              </div>
              : <ScrollArea className="flex p-2 flex-col min-h-[50vh] max-w-[100vw-2rem] justify-between">

                <h1 className="font-semibold pt-4 text-xs uppercase pl-2 pb-2 text-neutral-500">Invoice info</h1>

                {/* === Start of Customer Name & Payment Method & Invoice Date & Paid Fields  === */}
                <div className="grid grid-cols-2 md:grid-cols-[minmax(15rem,1fr)_minmax(8rem,15rem)_minmax(8rem,15rem)_auto] justify-start items-center gap-2">

                  {/* === Customer Name Field === */}
                  <div className="w-full py-2">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem className="group relative w-full m-1">
                          <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                            Customer Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              {...field}
                              className="h-10 w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* === Payment Method Select Field === */}
                  <div className="w-full py-2">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="group relative w-auto sm:max-w-sm m-1">
                          <FormLabel htmlFor="select_payment_invoice_form" className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                            <span className="hidden sm:block">Payment Method</span>
                            <span className="block sm:hidden">Pay via:</span>
                          </FormLabel>
                          <FormControl>
                            <SelectInput options={[
                              { label: 'Cash', value: 'cash' },
                              { label: 'Card', value: 'card' },
                              { label: 'Online', value: 'online' }
                            ]}
                              value={field.value ?? ""}
                              className="w-full rounded-lg"
                              onChange={field.onChange}
                              placeholder="Cash, Cred..."
                              id="select_payment_invoice_form"
                              disabled={!isPaidVar}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* === Invoice Date Field === */}
                  <div className="w-full py-2">
                    <FormField
                      control={form.control}
                      name="invoiceCreatedAt"
                      render={({ field }) => (
                        <FormItem className="group relative w-auto sm:max-w-sm m-1">
                          <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                            Invoice Date
                          </FormLabel>
                          <FormControl>
                            <DateInput {...field} disabled={!!data?.invoice.createdAt} className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* === Paid Switch Field === */}
                  <div className="w-32 py-2 flex justify-center">
                    <FormField
                      control={form.control}
                      name="isPaid"
                      render={({ field }) => (
                        <FormItem className="flex flex-row">
                          <FormLabel htmlFor="is_paid_radio_button">Paid</FormLabel>
                          <FormControl>
                            <SwitchInput
                              {...field}
                              value={!!field.value}
                              onChange={(checked: boolean) => field.onChange(checked)}
                              className="px-2"
                              id="is_paid_radio_button"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* === End of Customer Name & Payment Method & Invoice Date & Paid Fields  === */}

                <h1 className="font-semibold text-xs uppercase pl-2 py-2 text-neutral-500">Order info</h1>

                {/* === Start of Order Id & Table Id & Waiter Id & Order Type & Order Date === */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] border-b border-dashed justify-start items-center gap-2">
                  {/* === Order Id Field === */}
                  <div className="w-full py-2">
                    <FormField
                      control={form.control}
                      name="orderId"
                      render={({ field }) => (
                        <FormItem className="group relative w-full m-1">
                          <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                            Order ID
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              {...field}
                              className="h-10 w-full"
                              readOnly
                              value={field?.value ? field.value : 'Fresh'}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* === Table Select Field === */}
                  <div className="w-full py-2">
                    <FormField
                      control={form.control}
                      name="tableId"
                      render={({ field }) => (
                        <FormItem className="group relative w-auto sm:max-w-sm m-1">
                          <FormLabel htmlFor="select_table_invoice_form" className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                            Select Table
                          </FormLabel>
                          <FormControl>
                            <SelectInput options={tables}
                              value={field.value ?? ""}
                              className="w-full rounded-lg"
                              onChange={field.onChange}
                              placeholder="Cash, Cred..."
                              id="select_table_invoice_form"
                              disabled={!isDineInVar}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* === Order Type Select Field === */}
                  <div className="w-full py-2">
                    <FormField
                      control={form.control}
                      name="orderType"
                      render={({ field }) => (
                        <FormItem className="group relative w-auto sm:max-w-sm m-1">
                          <FormLabel htmlFor="select_orderType_invoice_form" className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                            Order Type
                          </FormLabel>
                          <FormControl>
                            <SelectInput options={[
                              { value: 'dine_in', label: 'Dine In' },
                              { value: 'drive_thru', label: 'Drive Thru' },
                              { value: 'takeaway', label: 'Take Away' }
                            ]}
                              value={field.value ?? ""}
                              className="w-full rounded-lg"
                              onChange={field.onChange}
                              placeholder="Cash, Cred..."
                              id="select_orderType_invoice_form"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* === Order Date Field === */}
                  <div className="w-full py-2">
                    <FormField
                      control={form.control}
                      name="orderCreatedAt"
                      render={({ field }) => (
                        <FormItem className="group relative w-auto sm:max-w-sm m-1">
                          <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                            Order Date
                          </FormLabel>
                          <FormControl>
                            <DateInput {...field} className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* === End of Order Id & Table Id & Waiter Id & Order Type & Order Date === */}

                <h1 className="font-semibold text-xs uppercase pl-2 pt-2 text-neutral-500">Order Items</h1>

                {errors.orderItems?.root?.message && (
                  <p className="text-sm pl-2 pb-2 font-rubik-400 text-red-600 mt-2">
                    {errors.orderItems.root.message}
                  </p>
                )}

                {/* Start of Dynamic Order Items Fields */}
                <div className="w-full">

                  {/* === Start of Order Item Id & Order Option Id & Qty Input & Price Input === */}
                  <ScrollArea className="w-[calc(100vw-3rem)] overflow-x-auto">
                    {fields.map((field, index) => (
                      <DynamicOrderItemRow
                        key={field.id}
                        index={index}
                        control={control}
                        menuItems={menuItems}
                        remove={remove}
                        watch={watch}
                        setValue={setValue}
                      />
                    ))}
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>

                  <Button type="button" variant="green" size='icon' className="ml-2 mb-2" onClick={() => append({
                    menuItemImage: null,
                    menuItemId: "",
                    menuItemName: "",
                    menuItemOptionId: null, // Explicitly null
                    menuItemOptionName: null, // Explicitly null
                    quantity: 1,
                    price: "0"
                  })}>
                    <Plus />
                  </Button>
                  {/* === End of Order Id & Table Id & Waiter Id & Order Type & Order Date === */}
                </div>
                {/* End of Dynamic Order Items Fields */}

                <ScrollBar orientation="vertical" />
              </ScrollArea>}

            {/* === Dialog Footer Buttons === */}
            <DialogFooter className="p-3 z-20 md:mb-3  border-t border-dashed justify-between bottom-0 flex flex-col sm:flex-col lg:flex-row pt-0">

              {/* === Start of Sub Total & Discount & Total & Arears & Grand Total === */}
              <div className="grid grid-cols-3 sm:grid-cols-[minmax(6rem,15rem)_minmax(6rem,15rem)_minmax(6rem,15rem)_minmax(6rem,15rem)_minmax(6rem,15rem)] justify-start items-center gap-2">

                {/* === Sub Total Input Field === */}
                <div className="w-full py-2">
                  <FormField
                    control={form.control}
                    name="subTotalAmount"
                    render={({ field }) => (
                      <FormItem className="group relative w-full m-1">
                        <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                          Subtotal
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="h-10 w-full"
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* === Discount Input Field === */}
                <div className="w-full py-2">
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem className="group relative w-auto sm:max-w-sm m-1">
                        <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                          <span className="block sm:hidden">Disc %</span>
                          <span className="hidden sm:block">Discount %</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="h-10 w-full"
                            step="1"
                            min={0}
                            max={100}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* === Total Input Field === */}
                <div className="w-full py-2">
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem className="group relative w-auto sm:max-w-sm m-1">
                        <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                          Total
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="h-10 w-full"
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="w-full py-2">
                  <FormField
                    control={form.control}
                    name="advancePaid"
                    render={({ field }) => (
                      <FormItem className="group relative w-auto sm:max-w-sm m-1">
                        <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                          <span className="hidden sm:block">Advance Paid</span>
                          <span className="block sm:hidden">Adv.</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="h-10 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* === Grand Total Input Field === */}
                <div className="w-full col-span-2 sm:col-span-1 py-2">
                  <FormField
                    control={form.control}
                    name="grandTotal"
                    render={({ field }) => (
                      <FormItem className="group relative w-auto sm:max-w-sm m-1">
                        <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                          Grand Total
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="h-10 w-full"
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              </div>
              {/* === End of Sub Total & Discount & Total & Arears & Grand Total === */}

              <div className="w-full flex flex-row justify-center items-center gap-2 lg:w-auto">
                <DialogClose asChild>
                  <Button variant="outline" className="min-w-24 sm:w-auto">Cancel</Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => ResetForm()}
                  className="min-w-24 sm:w-auto"
                >
                  Reset
                </Button>
                <Button type="submit" disabled={submitButtonLoading} variant="green" className="min-w-24 sm:w-auto">
                  {dataProp ? "Update" : "Create"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}