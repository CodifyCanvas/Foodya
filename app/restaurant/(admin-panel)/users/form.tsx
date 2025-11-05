"use client"

import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import toast from "react-hot-toast"
import { EyeIcon, EyeOffIcon, Loader } from "lucide-react"

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
import { ImagePicker } from "@/components/custom/inputs/image-picker"



// === Props ===
interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: User | null
  roles?: { label: string; value: string }[]
  [key: string]: unknown
}



export function FormDialog({ open, onOpenChange, data, roles = [] }: FormDialogProps) {

  /* === Local State === */
  const [isVisible, setIsVisible] = useState(false)
  const [manualReset, setManualReset] = useState(false)
  const [submitButtonLoading, setSubmitButtonLoading] = useState<boolean>(false)

  /* === React Hook Form Setup === */
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      id: undefined,
      image: undefined as unknown as File,
      name: "",
      email: "",
      password: "",
      is_active: false,
      role_id: "",
    },
  })

  /* === Load Initial Values When Editing === */
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

  /* === Toggle Password Visibility === */
  const togglePasswordVisibility = useCallback(() => {
    setIsVisible(prev => !prev)
  }, [])

  /* === Submit Handler === */
  async function onSubmit(formValues: z.infer<typeof userFormSchema>) {
    const API_URL = "/api/users"
    const isEditing = !!data?.id

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
      method: isEditing ? "PUT" : "POST",
      body: formData,
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
    } finally {
      setSubmitButtonLoading(false)
    }
  }

  /* === Reset Handler === */
  const ResetForm = () => {
    setManualReset(true)
    form.reset({
      id: data?.id ?? 0,
      image: undefined as unknown as File,
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-rows-[auto_1fr_auto]">

            {/* === Dialog Header === */}
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{data ? "Edit User" : "Create New User"}</DialogTitle>
              <DialogDescription className="sr-only">
                Create or update user information
              </DialogDescription>
            </DialogHeader>

            {/* === Scrollable Form Area === */}
            <ScrollArea className="p-3 flex flex-col justify-between">

              {/* === Item Image Field === */}
              <div className="w-full justify-center flex py-2">
                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem className="group relative w-auto sm:max-w-sm m-1">
                      <FormLabel className="bg-card text-muted-foreground  absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                        Item Image
                      </FormLabel>
                      <FormControl>
                        <ImagePicker
                          control={form.control}
                          name="image"
                          allowedTypes={["png", "jpg", "jpeg", "webp"]}
                          currentImageUrl={data?.image ?? undefined} // <- optional existing image
                          className="rounded-lg size-30 sm:size-40"
                          imageClassName="rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* === Name Input Field === */}
              <div className="w-full py-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="group relative w-auto sm:max-w-sm m-1">
                      <FormLabel className="absolute start-2 top-0 z-10 bg-card text-muted-foreground  -translate-y-1/2 px-1 text-xs">
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
                      <FormLabel className="absolute start-2 top-0 z-10 bg-card text-muted-foreground  -translate-y-1/2 px-1 text-xs">
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
                      <FormLabel className="absolute start-2 top-0 z-10 bg-card text-muted-foreground  -translate-y-1/2 px-1 text-xs">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input id="password" type={isVisible ? "text" : "password"} className="pe-10 pt-2 h-10 border-b" placeholder="●●●●●●" autoComplete="current-password" {...field} />
                          <Button title={isVisible ? "Hide password" : "Show password"} type="button" size="icon" variant="ghost" onClick={togglePasswordVisibility} className="absolute inset-y-0.5 end-0 text-muted-foreground hover:bg-transparent" >
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
                        <FormLabel className="absolute start-2 top-0 z-10 bg-card text-muted-foreground  -translate-y-1/2 px-1 text-xs">
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
            <DialogFooter className="p-6 pt-0 flex flex-col sm:flex-col gap-3 w-full">
              {/* === Submit Button === */}
              <Button type="submit" className="w-full" disabled={submitButtonLoading} variant="green" >
                {submitButtonLoading ? (
                  <p className="flex flex-row gap-2">
                    <Loader className="animate-spin duration-300" />
                    {data ? "Updating" : "Creating"}
                  </p>
                ) : data ? "Update" : "Create"}
              </Button>

              {/* === Reset + Cancel Buttons === */}
              <div className="flex w-full gap-2">
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
