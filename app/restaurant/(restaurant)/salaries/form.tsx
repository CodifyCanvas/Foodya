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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmployeeSalaryPostingFormSchema } from "@/lib/zod-schema/restaurant.zod"

import toast from 'react-hot-toast'
import { refreshData } from "@/lib/swr"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { formatMonthYear, toCapitalizedWords } from "@/lib/utils"
import { DynamicSalaryItemRow } from "./dynamic-salary-item-row"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader } from "lucide-react"
import { PayrollDialogSalaryRow } from "@/lib/definations"
import { FormsLoadingScreen } from "@/components/fallbacks/loadings"

/* === Props Interface === */
interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: { employeeId: number };
  [key: string]: any;
}

export function RoleForm({ open, onOpenChange, data: dataProp }: FormDialogProps) {
  /* === Local State === */
  const [salariesData, setSalariesData] = useState<PayrollDialogSalaryRow[]>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [footerDetails, setFooterDetails] = useState({
    totalBalance: 0,
    selectedSalariesToPay: 0,
  });

  /* === React Hook Form Setup === */
  const form = useForm<z.infer<typeof EmployeeSalaryPostingFormSchema>>({
    resolver: zodResolver(EmployeeSalaryPostingFormSchema),
    defaultValues: {
      salaries: [],
    },
  })

  const { control, watch, setValue, reset } = form;

  // useFieldArray for array of salaries
  const { fields } = useFieldArray({
    control,
    name: "salaries",
  });

  /* === Fetch Salaries Data === */
  useEffect(() => {
    if (!open || !dataProp?.employeeId) return;

    const fetchPayrolls = async () => {
      setIsLoading(true);
      toast.loading("Fetching Employee Payrolls...", { id: 'fetching-payrolls-toast' });

      try {
        const response = await fetch(`/api/payrolls/employee/${dataProp.employeeId}`);
        const result = await response.json();
        setSalariesData(result);
      } catch (error) {
        console.error("Payroll fetch error:", error);
        toast.error(`Failed to fetch Payrolls for Employee #${dataProp.employeeId}`);
      } finally {
        setIsLoading(false);
        toast.dismiss("fetching-payrolls-toast");
      }
    };

    fetchPayrolls();
  }, [open, dataProp?.employeeId]);

  /* === Set Form Values When Salaries Fetched === */
  useEffect(() => {
    if (!salariesData) return;

    reset({
      salaries: salariesData.map((s) => ({
        ...s,
        selected: false,
        description: s.description ?? "",
      })),
    });
  }, [salariesData, reset]);

  /* === Watch Selected Salaries and Calculate Totals === */
  useEffect(() => {
    const subscription = watch((values) => {
      const totalBalance = salariesData?.reduce(
        (sum, salary) => sum + parseFloat(salary.totalPay || "0"),
        0
      ) ?? 0;

      const selectedSalariesToPay = values.salaries?.reduce(
        (sum, salary) => salary?.selected ? sum + parseFloat(salary?.totalPay || "0") : sum,
        0
      ) ?? 0;

      setFooterDetails({ totalBalance, selectedSalariesToPay });
    });

    return () => subscription.unsubscribe();
  }, [watch, salariesData]);


  /* === Submit Handler === */
  async function onSubmit(formValues: z.infer<typeof EmployeeSalaryPostingFormSchema>) {
    const API_URL = `/api/payrolls/employee/${dataProp.employeeId}`;

    // Only keep selected salaries
    const filtered = {
      salaries: formValues.salaries.filter((s) => s.selected),
    };

    if (filtered.salaries.length === 0) {
      toast.error("Please select at least one salary before submitting.");
      return;
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filtered),
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(API_URL, requestOptions)
      const result = await response.json()

      {/* === Show warning toast for duplicate/409 error === */ }
      if (result.status === 409) {
        toast.error(result?.message ?? "Duplicate value found.");
        return;
      }

      if (!response.ok) {
        toast.error(result?.message ?? "Submission failed. Try again.")
        return
      }

      toast.success(result?.message ?? "Salaries updated successfully.")

      reset();
      refreshData('/api/payrolls')
      onOpenChange(false)

    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  /* === Reset Form Handler === */
  const handleResetForm = () => {
    if (salariesData) {
      reset({
        salaries: salariesData.map((s) => ({
          ...s,
          selected: false,
          description: s.description ?? "",
        })),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0" variant="full-screen">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-[calc(100vh-1rem)] grid grid-rows-[auto_1fr_auto]">

            {/* === Dialog Header === */}
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Manage Employee Salary</DialogTitle>
              <DialogDescription className="sr-only">
                Update Employee Salary
              </DialogDescription>
            </DialogHeader>

            {/* === Scrollable Form Area === */}
            {isLoading
              ? <FormsLoadingScreen />
              : (<ScrollArea className="flex border-b border-dashed mb-3 flex-col min-h-[50vh] max-w-[100vw-2rem] justify-between overflow-hidden py-3 px-6">

                <Accordion type="single" collapsible>
                  {fields.length > 0 ? fields.map((field, index) => (
                    <AccordionItem key={field.id} value={field.month}>
                      <div className="w-full flex items-center gap-2 py-1">
                        <FormField
                          control={form.control}
                          name={`salaries.${index}.selected`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Checkbox
                                  id={`select-salary-${index}-accordion`}
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <AccordionTrigger className="w-full justify-between">
                          <span>{formatMonthYear(field.month)}</span>
                        </AccordionTrigger>

                      </div>
                      <AccordionContent className="py-1 sm:py-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2 ">

                        {/* === Input Fields === */}
                        <DynamicSalaryItemRow key={field.id} index={index} control={control} watch={watch} setValue={setValue} />

                      </AccordionContent>
                    </AccordionItem>
                  )) : <div className="h-full w-full bg-card flex flex-col justify-center items-center text-center gap-2 p-4">
                    <p className="text-sm md:text-base font-medium text-muted-foreground">Oops! Nothing to show here</p>
                    <p className="text-sm md:text-base font-medium text-muted-foreground">Try refreshing or check back later</p>
                  </div>

                  }
                </Accordion>

              </ScrollArea>)}

            {/* === Footer === */}
            <DialogFooter className="p-3 sm:p-6 grid gap-4 grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center justify-between pt-0">
              {/* === Footer Totals === */}
              <div className="grid grid-cols-2 gap-2 items-center mb-2 md:mb-0">
                {/* Total Unpaid Salaries */}
                <div className="w-full min-w-32 relative group h-10 p-2 border rounded-lg text-center">
                  <Label className="absolute left-2 top-0 z-10 -translate-y-1/2 bg-card px-1 text-xs text-muted-foreground">
                    Total Unpaid Salaries
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-end text-sm">
                        {footerDetails.totalBalance?.toFixed(2) ?? "—"}
                      </div>
                    </TooltipTrigger>
                    {footerDetails.totalBalance !== null &&
                      footerDetails.totalBalance !== undefined && (
                        <TooltipContent className="text-sm max-w-xs text-center">
                          <p>{toCapitalizedWords(footerDetails.totalBalance ?? 0)}</p>
                        </TooltipContent>
                      )}
                  </Tooltip>
                </div>

                {/* Selected Salaries To Pay */}
                <div className="w-full min-w-40 relative group h-10 p-2 border rounded-lg text-center">
                  <Label className="absolute left-2 top-0 z-10 -translate-y-1/2 bg-card px-1 text-xs text-muted-foreground">
                    Selected Salaries To Pay
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-end text-sm">
                        {footerDetails.selectedSalariesToPay?.toFixed(2) ?? "—"}
                      </div>
                    </TooltipTrigger>
                    {footerDetails.selectedSalariesToPay !== null &&
                      footerDetails.selectedSalariesToPay !== undefined && (
                        <TooltipContent className="text-sm max-w-xs text-center">
                          <p>{toCapitalizedWords(footerDetails.selectedSalariesToPay)}</p>
                        </TooltipContent>
                      )}
                  </Tooltip>
                </div>
              </div>

              <div className="lg:block hidden" />

              {/* === Footer Buttons === */}
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-flow-col md:auto-cols-max w-full md:w-auto">
                {/* Reset Button */}
                <Button
                  type="button"
                  variant="secondary"
                  className="min-w-32 order-2 sm:order-1 md:order-1"
                  onClick={handleResetForm}
                >
                  Reset
                </Button>

                {/* Cancel Button */}
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="min-w-32 order-3 sm:order-2 md:order-2"
                  >
                    Cancel
                  </Button>
                </DialogClose>

                {/* Update Button */}
                <Button
                  type="submit"
                  className="col-span-2 sm:col-span-1 order-1 sm:order-3 md:order-3 min-w-32"
                  disabled={isSubmitting}
                  variant="green"
                >
                  Update
                </Button>
              </div>
            </DialogFooter>


          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}