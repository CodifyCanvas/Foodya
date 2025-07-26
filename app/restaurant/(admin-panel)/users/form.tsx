"use client"

import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import toast from "react-hot-toast"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { userFormSchema } from "@/lib/zod-schema"
import { refreshData } from "@/lib/swr"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import SwitchInput from "@/components/ui/switch-input"
import { ComboboxInput } from "@/components/ui/combobox-input"
import { User } from "@/lib/definations"

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: User | null
  roles?: { label: string; value: string }[]
  [key: string]: any
}

export function FormDialog({ open, onOpenChange, data, roles = [] }: FormDialogProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [manualReset, setManualReset] = useState(false)

  { /* === Initialize react-hook-form with Zod validation schema === */ }
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      id: undefined,
      name: "",
      email: "",
      password: "",
      is_active: false,
      role_id: "",
    },
  })

  {/* === Reset from values if data changes (for editing) === */ }
  useEffect(() => {
    if (!manualReset && data) {
      form.reset({
        id: data.id ?? 0,
        name: data.name ?? "",
        email: data.email ?? "",
        password: data.password ?? "",
        is_active: data.is_active ?? false,
        role_id: data.role_id ?? "",
      })
    }
  }, [data, manualReset, form])

  {/* === Toggle Password Visibilty === */ }
  const togglePasswordVisibility = useCallback(() => {
    setIsVisible(prev => !prev)
  }, [])

  {/* === Handle Form Submit === */ }
  async function onSubmit(formValues: z.infer<typeof userFormSchema>) {
    const API_URL = "/api/users"
    const isEditing = !!data?.id

    const requestOptions = {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
    }

    try {
      const response = await fetch(API_URL, requestOptions)
      const result = await response.json()

      {/* === Show warning toast for duplicate/409 error === */ }
      if (result.status === 409) {
        toast.error(result?.message ?? "Duplicate value found.");
        return;
      }

      if (!response.ok) {
        toast.error(result?.message ?? (isEditing
          ? "User can't be updated. Please try again."
          : "User can't be created. Please try again."))
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
    }
  }

  {/* === Manual reset logic (with ID preserved if editing) === */ }
  const ResetForm = () => {
    setManualReset(true)
    form.reset({
      id: data?.id ?? 0,
      name: "",
      email: "",
      password: "",
      is_active: false,
      role_id: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* === Dialog Header === */}
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{data ? "Edit User" : "Create User"}</DialogTitle>
              <DialogDescription className="sr-only">
                Create or update user information
              </DialogDescription>
            </DialogHeader>

            {/* === Form Content === */}
            <ScrollArea className="p-3 flex flex-col justify-between overflow-hidden">
              {/* === Name Input Field === */}
              <div className="w-full py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="group relative w-auto sm:max-w-sm m-1">
                      <FormLabel className="absolute start-2 top-0 z-10 bg-background text-foreground -translate-y-1/2 px-1 text-xs">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter Name" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* === Email Input Field === */}
              <div className="w-full py-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="group relative w-auto sm:max-w-sm m-1">
                      <FormLabel className="absolute start-2 top-0 z-10 bg-background text-foreground -translate-y-1/2 px-1 text-xs">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="example123@xyz.com" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* === Password Input Field === */}
              <div className="w-full py-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="group relative w-auto sm:max-w-sm m-1">
                      <FormLabel className="absolute start-2 top-0 z-10 bg-background text-foreground -translate-y-1/2 px-1 text-xs">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input id="password" type={isVisible ? "text" : "password"} className="pe-10 pt-2 h-10 border-b" placeholder="●●●●●●" autoComplete="current-password" {...field} />
                          <Button type="button" size="icon" variant="ghost" onClick={togglePasswordVisibility} className="absolute inset-y-0.5 end-0 text-muted-foreground hover:bg-transparent" >
                            {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                            <span className="sr-only">
                              {isVisible ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* === Status & Role Field === */}
              <div className="flex flex-row-reverse w-full items-end gap-2">
                {/* === Status Switch Field === */}
                <div className="w-1/3 py-2 flex justify-end items-end">
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs px-4">Active</FormLabel>
                        <FormControl>
                          <SwitchInput
                            {...field}
                            value={!!field.value}
                            onChange={(checked: boolean) => field.onChange(checked)}
                            className="px-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* === Role Select Input Field === */}
                <div className="w-2/3 py-2">
                  <FormField
                    control={form.control}
                    name="role_id"
                    render={({ field }) => (
                      <FormItem className="group relative w-auto sm:max-w-sm m-1">
                        <FormLabel className="absolute start-2 top-0 z-10 bg-background text-foreground -translate-y-1/2 px-1 text-xs">
                          Role
                        </FormLabel>
                        <FormControl>
                          <ComboboxInput
                            {...field}
                            value={field.value ?? ""}
                            onSelect={field.onChange}
                            options={roles}
                            placeholder="Select a role"
                            className="font-rubik-400 cursor-pointer"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </ScrollArea>

            {/* === Footer Buttons === */}
            <DialogFooter className="p-6 justify-between pt-0">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="button" variant="secondary" onClick={ResetForm}>
                Reset
              </Button>
              <Button type="submit" variant="green">
                {data ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
