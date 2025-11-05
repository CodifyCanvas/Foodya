"use client"

import { useEffect, useState } from "react"

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
import { ScrollArea } from "@/components/ui/scroll-area"

import toast from 'react-hot-toast'
import Stepper from "@/components/custom/Stepper"
import { EmployeePersonalInfoForm } from "./(edit-form-child)/employee-personal-info-form"
import { EmployeeWithFullDetails } from "@/lib/definations"
import { EmployeeRecordsInfoForm } from "./(edit-form-child)/employee-records-info-form"
import { EmployeeSalaryInfoForm } from "./(edit-form-child)/employee-salary-info-form"
import { FormsLoadingScreen } from "@/components/fallbacks/loadings"

/* === Props Interface === */
interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: { employeeId: number } | null
  [key: string]: any
}

export function EditEmployeeForm({ open, onOpenChange, data: dataProp }: FormDialogProps) {

  /* === Local State === */
  const [employeeFetching, setEmployeeFetching] = useState<boolean>(false)
  const [data, setData] = useState<EmployeeWithFullDetails | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(1)
  const steps = ["Personal Info", "Employment Record", "Salary History"];

  useEffect(() => {
    if (!dataProp?.employeeId) return;

    setEmployeeFetching(true);

    async function fetchEmployee() {
      try {
        toast.loading("Fetching Employee Details...", {
          id: 'fetching-employee-toast'
        })

        const response = await fetch(`/api/employees/${dataProp?.employeeId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();

        // Destructure to separate nested objects for form consumption
        const { employmentRecord, salaryChanges, ...personalInfoRaw } = result;

        const transformedData = {
          personalInfo: {
            ...personalInfoRaw,
          },
          employmentRecord,
          salaryChanges,
        };


        setData(transformedData ?? null);
      } catch (e) {
        console.error("Failed to fetch employee:", e);
        toast.error(`Failed to fetch employee #${dataProp?.employeeId}`)
      } finally {
        toast.dismiss("fetching-employee-toast")
        setEmployeeFetching(false);
      }
    }

    fetchEmployee();
  }, [dataProp]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[calc(100vh-1rem)] grid grid-rows-[auto_1fr_auto] p-0" variant="full-screen">

        {/* === Dialog Header === */}
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Edit Employee <span className="text-orange-500">#{dataProp?.employeeId}</span></DialogTitle>
          <DialogDescription className="sr-only">
            Update Employee
          </DialogDescription>
        </DialogHeader>

        {/* === Scrollable Form Area === */}
        {employeeFetching
          ? <FormsLoadingScreen />
          : <ScrollArea className="flex h-full my-2 min-h-[50vh] max-w-[100vw-2rem] flex-col justify-between p-3">

            {/* Stepper Navigation */}
            <div className="w-full flex justify-center">
              <Stepper currentStep={currentStep} steps={steps} />
            </div>

            {currentStep === 1 && <EmployeePersonalInfoForm data={data?.personalInfo ?? null} />}
            {currentStep === 2 && <EmployeeRecordsInfoForm data={{ employeeId: data?.personalInfo.id ?? null, designation: data?.employmentRecord[0]?.designation ?? null, joiningAt: data?.employmentRecord[0].joinedAt ?? null }} />}
            {currentStep === 3 && <EmployeeSalaryInfoForm data={{ employeeId: data?.personalInfo.id ?? null, currentSalary: data?.personalInfo.salary ?? null }} />}

          </ScrollArea>}

        {/* === Dialog Footer Buttons === */}
        <DialogFooter className="p-6 pt-0">
          <div className=" grid grid-cols-3 gap-2 sm:flex sm:justify-end sm:gap-2 " >
            {/* Cancel */}
            <DialogClose asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto sm:min-w-32"
              >
                Cancel
              </Button>
            </DialogClose>

            {/* Back */}
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="w-full sm:w-auto sm:min-w-32"
            >
              Back
            </Button>

            {/* Next */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={currentStep >= steps.length || employeeFetching}
              className="w-full sm:w-auto sm:min-w-32"
            >
              Next
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}