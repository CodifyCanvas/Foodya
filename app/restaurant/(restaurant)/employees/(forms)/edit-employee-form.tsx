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
import { Loader } from "lucide-react"
import { EmployeePersonalInfoForm } from "./(edit-form-child)/employee-personal-info-form"
import { EmployeeWithFullDetails } from "@/lib/definations"
import { EmployeeRecordsInfoForm } from "./(edit-form-child)/employee-records-info-form"
import { EmployeeSalaryInfoForm } from "./(edit-form-child)/employee-salary-info-form"

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
      <DialogContent className="p-0 grid grid-cols-1 grid-rows-[minmax(auto,4rem)_auto_minmax(15rem,1fr)_auto] " variant="full-screen">

            {/* === Dialog Header === */}
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Edit Employee <span className="text-orange-500">#{dataProp?.employeeId}</span></DialogTitle>
              <DialogDescription className="sr-only">
                Update Employee
              </DialogDescription>
            </DialogHeader>

            {/* Stepper Navigation */}
            <div className="w-full flex justify-center">
              <Stepper currentStep={currentStep} steps={steps} />
            </div>


            {/* === Scrollable Form Area === */}
            {employeeFetching ? <div className="h-full w-full bg-white flex justify-center items-center">
              <Loader className="animate-spin size-5 md:size-8 text-gray-500" />
            </div> : <ScrollArea className="flex h-full flex-col justify-between overflow-hidden p-3">

              {currentStep === 1 && <EmployeePersonalInfoForm data={data?.personalInfo ?? null} />}
              {currentStep === 2 && <EmployeeRecordsInfoForm data={{ employeeId : data?.personalInfo.id ?? null, joiningAt: data?.employmentRecord[0].joinedAt ?? null }} />}
              {currentStep === 3 && <EmployeeSalaryInfoForm data={{ employeeId : data?.personalInfo.id ?? null, currentSalary: data?.personalInfo.salary ?? null }} />}

            </ScrollArea>}

            {/* === Dialog Footer Buttons === */}
            <DialogFooter className="p-6 justify-between pt-0">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button
                type="button"
                variant="outline"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                Back
              </Button>

              
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentStep === steps.length}
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                >
                  Next
                </Button>
              
            </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}