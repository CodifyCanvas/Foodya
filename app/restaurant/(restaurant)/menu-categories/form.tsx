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

import { menuCategoriesFormSchema } from "@/lib/zod-schema/restaurant.zod"

import toast from 'react-hot-toast'
import { refreshData } from "@/lib/swr"
import { MenuCategories } from "@/lib/definations"
import { Loader } from "lucide-react"

/* === Props Interface === */
interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: MenuCategories | null
  [key: string]: any
}

export function RoleForm({ open, onOpenChange, data }: FormDialogProps) {
  /* === Local State === */
  const [manualReset, setManualReset] = useState(false)
  const [submitButtonLoading, setSubmitButtonLoading] = useState<boolean>(false)


  /* === React Hook Form Setup === */
  const form = useForm<z.infer<typeof menuCategoriesFormSchema>>({
    resolver: zodResolver(menuCategoriesFormSchema),
    defaultValues: {
      id: 0,
      name: "",
      description: "",
    },
  })

  /* === Load Initial Values When Editing === */
  useEffect(() => {
    if (!manualReset && data) {
      form.reset({
        id: data.id ?? 0,
        name: data.name ?? "",
        description: data.description ?? "",
      })
    }
  }, [data, manualReset, form])

  /* === Submit Handler === */
  async function onSubmit(formValues: z.infer<typeof menuCategoriesFormSchema>) {
    const API_URL = "/api/menu-categories";
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
      if (response.status === 409) {
        toast.error(result?.error ?? "Duplicate value found.");
        return;
      }

      if (!response.ok) {
        toast.error(result?.error ?? (isEditing
          ? "Category can't be updated. Please try again."
          : "Category can't be created. Please try again."))
        return
      }

      toast.success(result?.message ?? (isEditing
        ? "Category updated successfully."
        : "New Category created successfully."))

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
      name: "",
      description: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* === Dialog Header === */}
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{data ? "Edit Category" : "Create Category"}</DialogTitle>
              <DialogDescription className="sr-only">
                Create or Update your Category
              </DialogDescription>
            </DialogHeader>

            {/* === Scrollable Form Area === */}
            <ScrollArea className="flex flex-col justify-between overflow-hidden p-3">

              {/* === Category Name Field === */}
              <div className="w-full py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="group relative w-auto sm:max-w-sm m-1">
                      <FormLabel className="bg-card text-muted-foreground  absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                        Category Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter Category"
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* === Category Description Field === */}
              <div className="w-full py-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="group relative w-auto sm:max-w-sm m-1">
                      <FormLabel className="bg-card text-muted-foreground  absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            {/* === Dialog Footer Buttons === */}
            <DialogFooter className="p-6 pt-0 flex flex-col sm:flex-col gap-3 w-full">
              {/* === Submit Button === */}
              <Button type="submit" className="w-full" disabled={submitButtonLoading} variant="green" >
                {submitButtonLoading ? (
                  <p className="flex flex-row gap-2">
                    <Loader className="animate-spin duration-300" /> {data ? "Updating" : "Creating"}
                  </p>
                ) : data ? "Update" : "Create"}
              </Button>

              {/* === Reset + Cancel Buttons === */}
              <div className="flex w-full  gap-2">
                <Button type="button" className="flex-1" variant="secondary" onClick={ResetForm} >
                  Reset
                </Button>

                <DialogClose asChild>
                  <Button className="flex-1" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}