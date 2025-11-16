"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Form,
} from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmployeePersonalInfoFormSchema } from "@/lib/zod-schema/restaurant.zod"

import toast from 'react-hot-toast'
import { refreshData } from "@/lib/swr"
import { EmployeePersonalInfoInterface } from "@/lib/definations"
import { EmployeePersonalInfo } from "../(form-fields)/employee-personal-info-fields"
import { useHookFormMask } from "use-mask-input"

/* === Props Interface === */
interface FormDialogProps {
  data: EmployeePersonalInfoInterface | null;
}

/* === Employee Personal Info Form === */
export function EmployeePersonalInfoForm({ data }: FormDialogProps) {

  /* === Local State === */
  const [submitButtonLoading, setSubmitButtonLoading] = useState<boolean>(false)

  /* === React Hook Form Setup === */
  const form = useForm<z.infer<typeof EmployeePersonalInfoFormSchema>>({
    resolver: zodResolver(EmployeePersonalInfoFormSchema),
    defaultValues: {
      id: data?.id ?? null,
      image: undefined as unknown as File,
      name: data?.name ?? '',
      CNIC: data?.CNIC ?? '',
      fatherName: data?.fatherName ?? '',
      email: data?.email ?? '',
      phone: data?.phone ?? '',
    },
  })

  const registerWithMask = useHookFormMask(form.register);

  /* === Load Initial Values When Editing === */
  useEffect(() => {
    if (data) {
      form.reset({
        id: data?.id ?? null,
        image: undefined as unknown as File,
        name: data?.name ?? '',
        CNIC: data?.CNIC ?? '',
        fatherName: data?.fatherName ?? '',
        email: data?.email ?? '',
        phone: data?.phone ?? '',
      })
    }
  }, [data, form])

  /* === Submit Handler === */
  async function onSubmit(formValues: z.infer<typeof EmployeePersonalInfoFormSchema>) {
    const API_URL = `/api/employees/${data?.id}`;

    {/* === Prepare FormData === */ }
    const formData = new FormData();
    const { image, ...rest } = formValues;

    {/* === Send Zod values (without image) as JSON string === */ }
    formData.append("data", JSON.stringify(rest));

    {/* === Handle image === */ }
    if (image instanceof File) {
      formData.append("image", image);  // <- New file uploaded
    } else if (image === null) {
      formData.append("image", ""); // <- Signal to remove existing image
    }

    const requestOptions = {
      method: "PUT",
      body: formData,
    }

    try {
      setSubmitButtonLoading(true)

      const response = await fetch(API_URL, requestOptions)
      const result = await response.json()

      // === Handle Duplicate / 409 Error ===
      if (response.status === 409) {
        toast.error(result?.error ?? "Duplicate value found.");
        return;
      }

      if (!response.ok) {
        toast.error(result?.error ?? "Employee info can't be updated. Please try again.")
        return
      }

      toast.success(result?.message ?? "Employee Personal Info updated successfully.")
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
      id: data?.id,
      image: undefined as unknown as File,
      name: '',
      CNIC: '',
      fatherName: '',
      email: '',
      phone: '',
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 h-full">

        {/* === Scrollable Form Area === */}
        <ScrollArea className="flex h-full flex-col justify-between overflow-hidden p-3">

          <EmployeePersonalInfo control={form.control} image={data?.image} registerWithMask={registerWithMask} mode="edit" />

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