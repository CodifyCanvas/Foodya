"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { bookingsTablesFormSchema } from "@/lib/zod-schema/restaurant.zod"

import toast from 'react-hot-toast'
import { refreshData } from "@/lib/swr"
import { BookingsTablesInterface } from "@/lib/definations"
import { ComboboxInput } from "@/components/ui/combobox-input"
import { DateTimeRangePicker } from "@/components/custom/date-duration-picker"

/* === Props Interface === */
interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: BookingsTablesInterface | null
  [key: string]: any
}

export function RoleForm({ open, onOpenChange, data, tables = [] }: FormDialogProps) {
  /* === Local State === */
  const [manualReset, setManualReset] = useState(false)
  const [submitButtonLoading, setSubmitButtonLoading] = useState<boolean>(false)

  /* === React Hook Form Setup === */
  const form = useForm<z.infer<typeof bookingsTablesFormSchema>>({
    resolver: zodResolver(bookingsTablesFormSchema),
    defaultValues: {
      id: 0,
      tableId: "",
      customerName: "",
      advancePaid: "",
      reservationEnd: new Date(),
      reservationStart: new Date(),
    },
  })

  /* === Load Initial Values When Editing === */
  useEffect(() => {
    if (!manualReset && data) {
      form.reset({
        id: data.id ?? 0,
        tableId: data.tableId ?? "",
        customerName: data.customerName ?? "",
        advancePaid: data.advancePaid ?? "",
        reservationStart: data.reservationStart ? new Date(data.reservationStart) : new Date(),
        reservationEnd: data.reservationEnd ? new Date(data.reservationEnd) : new Date(),
      })
    }
  }, [data, manualReset, form])

  /* === Submit Handler === */
  async function onSubmit(formValues: z.infer<typeof bookingsTablesFormSchema>) {
    const API_URL = "/api/bookings-tables";
    const isEditing = !!data?.id;

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
          ? "Reservation can't be updated. Please try again."
          : "Reservation can't be created. Please try again."))
        return
      }

      toast.success(result?.message ?? (isEditing
        ? "Reservation updated successfully."
        : "New Reservation created successfully."))

      // Reset form only after successful create
      if (!isEditing) {
        form.reset()
      }

      refreshData(API_URL)
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
      id: data?.id ?? 0,
      tableId: "",
      customerName: "",
      advancePaid: "",
      reservationEnd: new Date(),
      reservationStart: new Date(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* === Dialog Header === */}
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{data ? "Edit Reservation" : "Create Reservation"}</DialogTitle>
              <DialogDescription className="sr-only">
                Create or Update your role
              </DialogDescription>
            </DialogHeader>

            {/* === Scrollable Form Area === */}
            <ScrollArea className="flex flex-col justify-between overflow-hidden p-3">

              {/* === Customer Name Field === */}
              <div className="w-full py-2">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem className="group relative w-auto sm:max-w-sm m-1">
                      <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                        Customer Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter Name"
                          {...field}
                          className="h-10"
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
                      <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                        Table
                      </FormLabel>
                      <FormControl>
                        <ComboboxInput
                          {...field}
                          value={field.value ?? ""}
                          onSelect={field.onChange}
                          options={tables}
                          placeholder="Select a table"
                          className="font-rubik-400 cursor-pointer"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* === Reservation Date & Time Range === */}
              <div className="w-full py-2">
                <FormItem className="group relative w-auto sm:max-w-sm m-1">
                  <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                    Reservation Date
                  </FormLabel>
                  <FormControl>
                    <DateTimeRangePicker
                      nameStart="reservationStart"
                      nameEnd="reservationEnd"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>

              {/* === Advance Paid Field === */}
              <div className="w-full py-2">
                <FormField
                  control={form.control}
                  name="advancePaid"
                  render={({ field }) => (
                    <FormItem className="group relative w-auto sm:max-w-sm m-1">
                      <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                        Advanced Payment
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Amount"
                          {...field}
                          className="h-10 hide-spinner"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            {/* === Dialog Footer Buttons === */}
            <DialogFooter className="p-6 justify-between pt-0">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                type="button"
                variant="secondary"
                onClick={() => ResetForm()}
              >
                Reset
              </Button>
              <Button type="submit" disabled={submitButtonLoading} variant="green">
                {data ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}