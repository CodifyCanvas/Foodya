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

import { menuItemFormSchema } from "@/lib/zod-schema/restaurant.zod"

import toast from 'react-hot-toast'
import { refreshData } from "@/lib/swr"
import { ItemWithOptions } from "@/lib/definations"
import { ComboboxInput } from "@/components/ui/combobox-input"
import SwitchInput from "@/components/ui/switch-input"
import { Plus, Trash2 } from "lucide-react"

/* === Props Interface === */
interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ItemWithOptions | null
  [key: string]: any
}

export function RoleForm({ open, onOpenChange, data, categories }: FormDialogProps) {
  /* === Local State === */
  const [manualReset, setManualReset] = useState(false)

  /* === React Hook Form Setup === */
  const form = useForm<
    z.input<typeof menuItemFormSchema>,  // Raw user input shape
    unknown,                            // Context if any
    z.output<typeof menuItemFormSchema> // Parsed & validated shape
  >({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      id: 0,
      item: "",
      description: "",
      category_id: "",
      is_available: false,
      price: 0,
      options: [{ option_name: '', price: 0 }],
    },
  });

  const { control } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options'
  });

  /* === Load Initial Values When Editing === */
  useEffect(() => {
    if (!manualReset && data) {
      form.reset({
        id: data.id ?? 0,
        item: data.item ?? "",
        description: data.description ?? "",
        category_id: data.category_id ?? '',
        is_available: data.is_available ?? false,
        price: data.price ?? 0,
        options: data.options?.map(opt => ({
          option_name: opt.option_name,
          price: typeof opt.price === 'string' ? parseFloat(opt.price) : opt.price,
        })) ?? [{ option_name: '', price: 0 }]
      })
    }
  }, [data, manualReset, form])

  /* === Submit Handler === */
  async function onSubmit(formValues: z.infer<typeof menuItemFormSchema>) {
    const API_URL = "/api/menu-items";
    const isEditing = !!data?.id;

    const requestOptions = {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    }
  }

  /* === Reset Handler === */
  const ResetForm = () => {
    setManualReset(true)
    form.reset({
      id: data?.id ?? 0,
      item: '',
      description: '',
      category_id: '',
      is_available: false,
      price: 0,
      options: [{ option_name: '', price: 0 }]
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0" variant="full-screen">
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
            <ScrollArea className="flex flex-col max-h-[75vh] justify-between overflow-hidden p-3">

              <div className="flex flex-col sm:flex-row">

                {/* === Item Name Field === */}
                <div className="w-full py-2">
                  <FormField
                    control={form.control}
                    name="item"
                    render={({ field }) => (
                      <FormItem className="group relative w-auto sm:max-w-sm m-1">
                        <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                          Item Name
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
                
                {/* === Category Select Field === */}
                <div className="w-full py-2">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem className="group relative w-auto sm:max-w-sm m-1">
                        <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                          Category
                        </FormLabel>
                        <FormControl>
                          <ComboboxInput
                            {...field}
                            value={field.value ?? ""}
                            onSelect={field.onChange}
                            options={categories}
                            placeholder="Select a category"
                            className="font-rubik-400 cursor-pointer"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* === General Price Field === */}
                <div className="w-full py-2">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="group relative w-auto sm:max-w-sm m-1">
                        <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                          Price
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="h-10 hide-spinner"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* === Description Field === */}
              <div className="flex flex-col sm:flex-row">
                <div className="w-full py-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="group relative w-auto sm:max-w-sm m-1">
                        <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
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

                {/* === Available Switch Field === */}
                <div className="w-full py-2">
                  <FormField
                    control={form.control}
                    name="is_available"
                    render={({ field }) => (
                      <FormItem className="group relative w-auto sm:max-w-sm m-1">
                        <FormLabel className="text-xs px-4">Available</FormLabel>
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
              </div>
                  
              {/* === Repeater Fields === */}
              <div>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 sm:flex-row flex-col">
                    
                    {/* === Reapeater Option Name Field === */}
                    <div className="w-full sm:w-1/2 py-2">
                      <FormField
                        control={form.control}
                        name={`options.${index}.option_name`}
                        render={({ field }) => (
                          <FormItem className="group relative w-auto sm:max-w-sm m-1">
                            <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                              Item Name
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
                    <div className="flex w-full flex-row items-end gap-2">

                      {/* === Repeater Option Price Field === */}
                      <div className="w-full sm:w-1/2 py-2">
                        <FormField
                          control={form.control}
                          name={`options.${index}.price`}
                          render={({ field }) => (
                            <FormItem className="group relative w-auto sm:max-w-sm m-1">
                              <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                                Item Price
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Enter Category"
                                  {...field}
                                  className="h-10 hide-spinner"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* === Remove Repeater Fields Button === */}
                      <Button type="button" className="mb-3 size-10" variant={"destructive"} onClick={() => remove(index)} size={"icon"}><Trash2 /></Button>
                    </div>
                  </div>
                ))} 
                {/* === Add Repeater Option & Price Fields Button === */}
                <Button type="button" className="bg-blue-500 size-10 mt-2 mb-2 hover:bg-blue-600" onClick={() => append({ option_name: '', price: 0 })}><Plus /></Button>
              </div>

            </ScrollArea>

            {/* === Dialog Footer Buttons === */}
            <DialogFooter className="p-6  flex flex-row justify-end pt-0 w-full fixed bottom-0 right-0">
              
              {/* === Cancel Form to and Close the Dialog Button === */}
              <DialogClose asChild>
                <Button className="w-24" variant="outline">Cancel</Button>
              </DialogClose>

              {/* === Reset Form to Defualt Button === */}
              <Button type="button" variant="secondary" className="w-24" onClick={() => ResetForm()}>Reset</Button>

              {/* === Form Submit Button === */}
              <Button type="submit" className="w-24" variant="green">{data ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}