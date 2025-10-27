"use client"

import { useMemo, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"

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
import { Form } from "@/components/ui/form"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Stepper from "@/components/custom/Stepper"
import { useHookFormMask } from 'use-mask-input';

import { FullEmployeeFormSchema } from "@/lib/zod-schema/restaurant.zod"
import { refreshData } from "@/lib/swr"

import { EmployeePersonalInfo } from "./(form-fields)/employee-personal-info-fields"
import { EmployeeRecords } from "./(form-fields)/employee-records-fields"
import { EmployeeSalaryInfo } from "./(form-fields)/employee-salary-info-fields"
import { Loader } from "lucide-react"


/* === Props Interface === */
interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: null
  [key: string]: any
}

/* === Form Values Type === */
export type EmployeeFormValues = z.infer<typeof FullEmployeeFormSchema>

/* === Create Employee Form Component === */
export function CreateEmployeeForm({ open, onOpenChange, data }: FormDialogProps) {

  /* === Local State === */
  const [submitButtonLoading, setSubmitButtonLoading] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const steps = ["Personal Info", "Employment Record", "Salary"];

  /* === React Hook Form Setup === */
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(FullEmployeeFormSchema),
    defaultValues: {
      personalInfo: {
        id: null,
        image: undefined as unknown as File,
        name: "",
        CNIC: "",
        fatherName: "",
        email: "",
        phone: "",
      },
      employmentRecord: {
        designation: "",
        shift: "",
        status: "active",
        joinedAt: "",
        resignedAt: null,
        changeType: "valid",
      },
      salaryChanges: {
        previousSalary: null,
        newSalary: "",
        reason: "",
        changeType: "initial",
      }
    },
  })

  const registerWithMask = useHookFormMask(form.register);

  /* === Submit Handler === */
  const onSubmit: SubmitHandler<EmployeeFormValues> = async (formValues) => {
    const API_URL = "/api/employees";
    const formData = new FormData();

    // Destructure image out
    const { personalInfo: { image, ...personalInfoRest }, ...rest } = formValues;

    // Reconstruct form data without image
    const dataWithoutImage = {
      ...rest,
      personalInfo: personalInfoRest
    };

    // Append JSON (non-file) data
    formData.append("data", JSON.stringify(dataWithoutImage));

    // Add image file if available
    if (image instanceof File) {
      formData.append("image", image);
    }

    const requestOptions = {
      method: "POST",
      body: formData,
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
        toast.error(result?.message ?? "Employee can't be created. Please try again.")
        console.error(result?.error)
        return
      }

      toast.success(result?.message ?? "New Employee created successfully.")

      // === Success ===
      form.reset()
      setCurrentStep(1)
      refreshData("/api/employees/all")
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
    form.reset({
      personalInfo: {
        id: null,
        image: undefined as unknown as File,
        name: "",
        CNIC: "",
        fatherName: "",
        email: "",
        phone: "",
      },
      employmentRecord: {
        designation: "",
        shift: "",
        status: "active",
        joinedAt: "",
        resignedAt: null,
        changeType: "valid",
      },
      salaryChanges: {
        previousSalary: null,
        newSalary: "",
        reason: "",
        changeType: "initial",
      },
    })

    setCurrentStep(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0" variant="full-screen">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-[calc(100vh-1rem)] grid grid-rows-[auto_1fr_auto]">

            {/* === Dialog Header === */}
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription className="sr-only">
                Create or Update your role
              </DialogDescription>
            </DialogHeader>




            {/* === Scrollable Form Area === */}
            <ScrollArea className="flex flex-col min-h-[50vh] max-w-[100vw-2rem] justify-between p-3">

              {/* Stepper Navigation */}
              <div className="w-full flex justify-center">
                <Stepper currentStep={currentStep} steps={steps} />
              </div>

              {currentStep === 1 && <EmployeePersonalInfo control={form.control} image={undefined} registerWithMask={registerWithMask} mode="create" />}
              {currentStep === 2 && <EmployeeRecords control={form.control} mode="create" />}
              {currentStep === 3 && <EmployeeSalaryInfo control={form.control} mode="create" />}

              <ScrollBar orientation="vertical" />
            </ScrollArea>

            {/* === Dialog Footer Buttons === */}
            <DialogFooter className="p-6 pt-0">
              <div className=" grid grid-cols-2 gap-2  sm:flex sm:flex-wrap sm:justify-end sm:gap-2 " >
                {/* Cancel */}
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto sm:min-w-32 order-4 sm:order-1"
                  >
                    Cancel
                  </Button>
                </DialogClose>

                {/* Reset */}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => ResetForm()}
                  className="w-full sm:w-auto sm:min-w-32 order-3 sm:order-2"
                >
                  Reset
                </Button>

                {/* Back */}
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="w-full sm:w-auto sm:min-w-32 order-1 sm:order-3"
                >
                  Back
                </Button>

                {/* Next / Submit */}
                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="w-full sm:w-auto sm:min-w-32 order-2 sm:order-4"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitButtonLoading}
                    variant="green"
                    className="w-full sm:w-auto sm:min-w-32 order-2 sm:order-4"
                  >
                    {submitButtonLoading ? (
                      <p className="flex flex-row gap-2">
                        <Loader className="animate-spin duration-300" />{" "}
                        {data ? "Updating" : "Creating"}
                      </p>
                    ) : data ? "Update" : "Create"}
                  </Button>
                )}
              </div>
            </DialogFooter>



          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}