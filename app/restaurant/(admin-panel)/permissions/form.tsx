"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "lucide-react";

import toast from "react-hot-toast";
import { permissionsFormSchema } from "@/lib/zod-schema";
import { Role } from "@/lib/definations";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Role | null;
  [key: string]: any;
}

type PermissionsFormData = z.infer<typeof permissionsFormSchema>;

export function RoleForm({ open, onOpenChange, data, refetchPermissions }: FormDialogProps) {
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // === Initialize react-hook-form with Zod schema ===
  const form = useForm<{ permissions: PermissionsFormData }>({
    resolver: zodResolver(z.object({ permissions: permissionsFormSchema })),
    defaultValues: { permissions: [] },
  });

  const { control, handleSubmit, reset } = form;

  const { fields } = useFieldArray({
    control,
    name: "permissions",
  });

  // === Fetch permissions when dialog is opened with a role ===
  useEffect(() => {
    if (!data?.id) return;

    const fetchPermissions = async () => {
      setFetchLoading(true);

      try {
        const response = await fetch("/api/permission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: data.id }),
        });

        const result = await response.json();

        if (Array.isArray(result)) {
          // === Clean and format the response ===
          const cleaned = result.map((item) => ({
            id: item.id,
            role_id: item.role_id,
            module_id: item.module_id,
            label: item.module_name,
            can_view: item.can_view,
            can_create: item.can_create,
            can_edit: item.can_edit,
            can_delete: item.can_delete,
          }));

          reset({ permissions: cleaned });
        } else {
          toast.error("Failed to load permissions.");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchPermissions();
  }, [data, reset]);

  // === Handle form submission ===
  const onSubmit = async (formValues: { permissions: PermissionsFormData }) => {
    setSubmitLoading(true);

    try {
      const response = await fetch("/api/permission", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues.permissions),
      });

      const result = await response.json();

      if (!response.ok) {
        // === Show warning toast for server error ===
        toast.error(result?.message || "Failed to update permissions.");
        return;
      }

      // === Success toast ===
      toast.success(result?.message || "Permissions updated successfully.");
      refetchPermissions();
      onOpenChange(false);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 font-rubik-400" variant="full-screen">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="h-[calc(100vh-1rem)] grid grid-rows-[auto_1fr_auto]">
            {/* === Header === */}
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="font-medium">Manage Permissions</DialogTitle>
              <DialogDescription className="sr-only">
                Create or Update your role
              </DialogDescription>
              <h3 className="md:text-2xl font-semibold capitalize opacity-95 text-emerald-600">
                Role: {data?.role}
              </h3>
            </DialogHeader>

            {/* === Permissions Table === */}
            <ScrollArea className="overflow-auto p-3">
              {fetchLoading ? (
                <div className="flex w-full min-h-[50vh] justify-center items-center">
                  <Loader className="animate-spin size-6 text-gray-500" />
                </div>
              ) : (
                <div className="min-w-max">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sm:text-center">Module</TableHead>
                        <TableHead className="text-center">View</TableHead>
                        <TableHead className="text-center">Create</TableHead>
                        <TableHead className="text-center">Edit</TableHead>
                        <TableHead className="text-center">Delete</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {fields.length > 0 ? (
                        fields.map((field, idx) => (
                          <TableRow key={field.id} className="sm:text-center">
                            <TableCell className="capitalize">{field.label || "N/A"}</TableCell>
                            {(["can_view", "can_create", "can_edit", "can_delete"] as const).map(
                              (permKey) => (
                                <TableCell key={permKey}>
                                  <FormField
                                    control={control}
                                    name={`permissions.${idx}.${permKey}`}
                                    render={({ field }) => (
                                      <FormItem className="flex justify-center">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value === true}
                                            onCheckedChange={(checked) =>
                                              field.onChange(checked === true)
                                            }
                                            className="mx-auto data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 border-emerald-600"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </TableCell>
                              )
                            )}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            No permissions found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              <ScrollBar orientation="horizontal" />
            </ScrollArea>


            {/* === Footer Actions === */}
            <DialogFooter className="p-3 z-20 md:mb-3 border-t border-dashed justify-between bottom-0 flex flex-col-reverse sm:flex-row  pt-0">
              <DialogClose asChild>
                <Button variant="outline" className="sm:w-32">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="sm:w-32" disabled={submitLoading} variant="green">
                {submitLoading ? <p className="flex flex-row gap-2"><Loader className="animate-spin duration-300" /> Updating</p> : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
