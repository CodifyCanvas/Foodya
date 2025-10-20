"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Form,
} from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmploymentRecordFormSchema } from "@/lib/zod-schema/restaurant.zod"

import toast from 'react-hot-toast'
import { refreshData } from "@/lib/swr"
import { EmployeeRecords } from "../(form-fields)/employee-records-fields"

/* === Props Interface === */
interface FormDialogProps {
  data: {
    employeeId: number | null;
    designation: string | null;
    joiningAt?: string | null;
  };
  [key: string]: any;
}

/* === Employee Records Info Form === */
export function EmployeeRecordsInfoForm({ data }: FormDialogProps) {

  /* === Local State === */
  const [submitButtonLoading, setSubmitButtonLoading] = useState<boolean>(false)

  /* === React Hook Form Setup === */
  const form = useForm<z.infer<typeof EmploymentRecordFormSchema>>({
    resolver: zodResolver(EmploymentRecordFormSchema),
    defaultValues: {
      designation: data?.designation ?? '',
      shift: '',
      status: 'active',
      joinedAt: data?.joiningAt ?? '',
      resignedAt: null,
      changeType: 'valid',
    },
  })

  /* === Submit Handler === */
  async function onSubmit(formValues: z.infer<typeof EmploymentRecordFormSchema>) {
    const API_URL = `/api/employees/${data.employeeId}/employment-records`;

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formValues),
    }

    try {
      setSubmitButtonLoading(true)

      const response = await fetch(API_URL, requestOptions)
      const result = await response.json()

      // === Handle Duplicate / 409 Error ===
      if (result.status === 409) {
        toast.error(result?.message ?? "Duplicate value found.");
        return;
      }

      if (!response.ok) {
        toast.error(result?.message ?? "Employee record can't be updated. Please try again.")
        return
      }

      toast.success(result?.message ?? "Employee Record Info updated successfully.")

      refreshData('/api/employees/all')

    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred. Please try again later.")
    } finally {
      setSubmitButtonLoading(false)
    }
  }

  /* === Reset Handler === */
  const ResetForm = () => {
    form.reset({
      designation: '',
      shift: '',
      status: 'active',
      joinedAt: data?.joiningAt ?? '',
      resignedAt: null,
      changeType: 'valid',
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 h-full">

        {/* === Scrollable Form Area === */}
        <ScrollArea className="flex h-full flex-col justify-between overflow-hidden p-3">

          <EmployeeRecords control={form.control} mode="edit" />

        </ScrollArea>

        {/* === Action Buttons === */}
        <div className="w-full flex gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={() => ResetForm()} >
            Reset
          </Button>
          <Button type="submit" disabled={submitButtonLoading} variant="green">
            Update
          </Button>
        </div>
      </form>
    </Form>
  )
}