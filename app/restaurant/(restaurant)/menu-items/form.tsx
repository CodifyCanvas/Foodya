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
import { Loader, Plus, Trash2 } from "lucide-react"
import { ImagePicker } from "@/components/custom/inputs/image-picker"

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
  const [submitButtonLoading, setSubmitButtonLoading] = useState<boolean>(false)

  /* === React Hook Form Setup === */
  const form = useForm<
    z.input<typeof menuItemFormSchema>,  // Raw user input shape
    unknown,                            // Context if any
    z.output<typeof menuItemFormSchema> // Parsed & validated shape
  >({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      id: 0,
      image: null,
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

    {/* === Request options for fetch === */ }
    const requestOptions = {
      method: isEditing ? "PUT" : "POST",
      body: formData,
    }

    try {
      setSubmitButtonLoading(true)

      {/* === Send request === */ }
      const response = await fetch(API_URL, requestOptions)
      const result = await response.json()

      {/* === Handle duplicate (409) errors === */ }
      if (result.status === 409) {
        toast.error(result?.error ?? "Duplicate value found.");
        return;
      }

      {/* === Handle other errors === */ }
      if (!response.ok) {
        toast.error(result?.error ?? (isEditing
          ? "Category can't be updated. Please try again."
          : "Category can't be created. Please try again."))
        return
      }

      {/* === Success toast === */ }
      toast.success(result?.message ?? (isEditing
        ? "Category updated successfully."
        : "New Category created successfully."))

      {/* === Reset form only on create === */ }
      if (!isEditing) {
        form.reset()
      }

      {/* === Refresh data and close modal === */ }
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-[calc(100vh-1rem)] grid grid-rows-[auto_1fr_auto]">

            {/* === Dialog Header === */}
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{data ? "Edit Menu Item" : "Create Menu Item"}</DialogTitle>
              <DialogDescription className="sr-only">
                Create or Update your Menu Item
              </DialogDescription>
            </DialogHeader>

            {/* === Scrollable Form Area === */}
            <ScrollArea className="flex flex-col min-h-[50vh] max-w-[100vw-2rem] justify-between p-3">

              <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-2 grid-rows-1 w-full">

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

                <div className=" w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[minmax(10rem,25rem)_minmax(10rem,25rem)_auto]  items-end ">

                  {/* === Item Name Field === */}
                  <div className="w-full py-2">
                    <FormField
                      control={form.control}
                      name="item"
                      render={({ field }) => (
                        <FormItem className="group relative w-auto sm:max-w-sm m-1">
                          <FormLabel className="bg-card text-muted-foreground  absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                            Item Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="e.g. Cheeseburger"
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
                          <FormLabel className="bg-card text-muted-foreground  absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                            Category
                          </FormLabel>
                          <FormControl>
                            <ComboboxInput
                              {...field}
                              value={field.value ?? ""}
                              onSelect={field.onChange}
                              options={categories}
                              placeholder="Select a category"
                              className="font-rubik-400 h-10 cursor-pointer"
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
                          <FormLabel className="bg-card text-muted-foreground  absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
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

                  {/* === Description Field === */}
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
              </div>

              <hr className="border border-dashed border-muted-foreground/35" />

              {/* === Repeater Fields === */}
              <div>
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[1fr_auto] grid-rows-2 sm:grid-rows-1 sm:grid-cols-[minmax(10rem,25rem)_minmax(10rem,25rem)_auto] items-end gap-2">

                    {/* === Reapeater Option Name Field === */}
                    <div className="w-full py-2 col-span-2 sm:col-span-1">
                      <FormField
                        control={form.control}
                        name={`options.${index}.option_name`}
                        render={({ field }) => (
                          <FormItem className="group relative w-auto sm:max-w-sm m-1">
                            <FormLabel className="bg-card text-muted-foreground  absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
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

                    {/* === Repeater Option Price Field === */}
                    <div className="w-full py-2">
                      <FormField
                        control={form.control}
                        name={`options.${index}.price`}
                        render={({ field }) => (
                          <FormItem className="group relative w-auto sm:max-w-sm m-1">
                            <FormLabel className="bg-card text-muted-foreground  absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
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
                ))}
                {/* === Add Repeater Option & Price Fields Button === */}
                <Button type="button" className="bg-blue-500 size-10 mt-2 mb-2 hover:bg-blue-600" onClick={() => append({ option_name: '', price: 0 })}><Plus /></Button>
              </div>

            </ScrollArea>

            {/* === Dialog Footer Buttons === */}
            <DialogFooter className="p-6 pt-0 w-full">
              <div className="grid gap-3 sm:flex sm:justify-end sm:items-center">
                {/* === Mobile Submit Button === */}
                <div className="order-1 sm:order-3 w-full sm:w-auto">
                  <Button
                    type="submit"
                    className="w-full sm:w-32"
                    disabled={submitButtonLoading}
                    variant="green"
                  >
                    {submitButtonLoading ? (
                      <p className="flex flex-row items-center gap-2">
                        <Loader className="animate-spin duration-300" />
                        {data ? "Updating" : "Creating"}
                      </p>
                    ) : data ? "Update" : "Create"}
                  </Button>
                </div>

                {/* === Reset + Cancel Buttons === */}
                <div className="grid grid-cols-2 gap-2 order-2 sm:order-1 sm:flex sm:w-auto">
                  <Button
                    type="button"
                    className="w-full sm:w-32"
                    variant="secondary"
                    onClick={ResetForm}
                  >
                    Reset
                  </Button>

                  <DialogClose asChild>
                    <Button className="w-full sm:w-32" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </DialogFooter>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}