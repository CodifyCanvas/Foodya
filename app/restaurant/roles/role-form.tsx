"use client"

import { useEffect } from "react"
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
import { Role } from "./columns"
import { roleFormSchema } from "@/lib/zod-schema"

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: Role | null
}



export function RoleForm({ open, onOpenChange, data }: FormDialogProps) {
  // Initialize form with react-hook-form and Zod resolver
  const form = useForm<z.infer<typeof roleFormSchema>>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { 
      id: undefined,
      role: "" 
    },
  })

  useEffect(() => {
  if (data) {
    // Defensive: only reset if role is defined
    form.reset({
      id: data.id ?? 0,
      role: data.role ?? "",
    })
  } else {
    form.reset({
      id: 0,
      role: "",
    })
  }
}, [data])

  // Submit handler
  function onSubmit(values: z.infer<typeof roleFormSchema>) {
    // Add your submit logic here

    if(values.id) {
      // Edit Logic
      console.log(values)
    } else {
      console.log(values.role)
    }
  }

  const ResetForm = () => {
    console.log("form reseted")
    form.reset({
      role: ""
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
     
          <DialogContent className="p-0">
             <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{data ? "Edit Role" : "Create Role"}</DialogTitle>
              <DialogDescription className="sr-only">
    Create or Update you data
  </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex flex-col justify-between overflow-hidden p-3">
              {/* Form Field */}
              <div className="w-full py-2">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem className="group relative w-auto sm:max-w-sm m-1">
                      <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                        Id
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter role" {...field} className="h-10 hide-spinner" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="w-full py-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="group relative w-auto sm:max-w-sm m-1">
                      <FormLabel className="bg-background text-foreground absolute start-2 top-0 z-10 block -translate-y-1/2 px-1 text-xs">
                        Role
                      </FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter role" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <DialogFooter className="p-6 justify-between pt-0">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="button" variant="secondary" onClick={() => ResetForm()}>
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
