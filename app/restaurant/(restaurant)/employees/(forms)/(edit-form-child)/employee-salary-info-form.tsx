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
import { SalaryChangeFormSchema } from "@/lib/zod-schema/restaurant.zod"

import toast from 'react-hot-toast'
import { refreshData } from "@/lib/swr"
import { EmployeeSalaryInfo } from "../(form-fields)/employee-salary-info-fields"

/* === Props Interface === */
interface FormDialogProps {
  data: {
    employeeId: number | null;
    currentSalary: string | null;
  };
  [key: string]: any;
}

/* === Employee Salary Changes Form === */
export function EmployeeSalaryInfoForm({ data }: FormDialogProps) {

  /* === Local State === */
  const [submitButtonLoading, setSubmitButtonLoading] = useState<boolean>(false)

  /* === React Hook Form Setup === */
  const form = useForm<z.infer<typeof SalaryChangeFormSchema>>({
    resolver: zodResolver(SalaryChangeFormSchema),
    defaultValues: {
      previousSalary: data.currentSalary ? String(data.currentSalary) : '',
      newSalary: "",
      reason: '',
      changeType: 'initial',
    },
  })


  /* === Submit Handler === */
  async function onSubmit(formValues: z.infer<typeof SalaryChangeFormSchema>) {
    const API_URL = `/api/employees/${data.employeeId}/salary-changes`;

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
        toast.error(result?.message ?? "Employee salary can't be updated. Please try again.")
        return
      }

      toast.success(result?.message ?? "Employee Salary Info updated successfully.")

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
      previousSalary: data.currentSalary ?? null,
      newSalary: "",
      reason: '',
      changeType: 'initial',
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 h-full">

        {/* === Scrollable Form Area === */}
        <ScrollArea className="flex h-full flex-col justify-between overflow-hidden p-3">

          <EmployeeSalaryInfo control={form.control} mode="edit" />

        </ScrollArea>

        {/* === Action Buttons === */}
        <div className="w-full flex gap-2 justify-end">
          <Button type="button" className="min-w-32" variant="secondary" onClick={() => ResetForm()} >
            Reset
          </Button>
          <Button type="submit" className="min-w-32" disabled={submitButtonLoading} variant="green">
            Update
          </Button>
        </div>
      </form>
    </Form>
  )
}