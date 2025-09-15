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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { moduleFormSchema } from "@/lib/zod-schema"

import toast from 'react-hot-toast'
import { refreshData } from "@/lib/swr"
import { ModuleInterface } from "@/lib/definations"

/* === Props Interface === */
interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ModuleInterface | null
  [key: string]: any
}

export function RoleForm({ open, onOpenChange, data }: FormDialogProps) {
  /* === Local State === */
  const [manualReset, setManualReset] = useState(false)
  const [submitButtonLoading, setSubmitButtonLoading] = useState<boolean>(false)

  /* === React Hook Form Setup === */
  const form = useForm<z.infer<typeof moduleFormSchema>>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      id: undefined,
      name: "",
      label: "",
    },
  })

  /* === Load Initial Values When Editing === */
  useEffect(() => {
    if (!manualReset && data) {
      form.reset({
        id: data.id ?? 0,
        name: data.name ?? "",
        label: data.label ?? "",
      })
    }
  }, [data, manualReset, form])

  /* === Submit Handler === */
  async function onSubmit(formValues: z.infer<typeof moduleFormSchema>) {
    const API_URL = "/api/module";
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
          ? "Role can't be updated. Please try again."
          : "Role can't be created. Please try again."))
        return
      }

      toast.success(result?.message ?? (isEditing
        ? "User updated successfully."
        : "New user created successfully."))

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
      label: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* === Dialog Header === */}
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{data ? "Edit Module" : "Create Module"}</DialogTitle>
              <DialogDescription className="sr-only">
                Create or Update your role
              </DialogDescription>
            </DialogHeader>

            {/* === Scrollable Form Area === */}
            <ScrollArea className="flex flex-col justify-between overflow-hidden p-3">

              {/* === Name Field === */}
              <div className="w-full py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="group relative w-auto sm:max-w-sm m-1">
                      <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter Page Name"
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormDescription className="font-rubik-300">Used to check access for this page.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* === Label Field === */}
              <div className="w-full py-2">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem className="group relative w-auto sm:max-w-sm m-1">
                      <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                        Label
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter Label"
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