import z from "zod";



/**
 * Image upload schema
 * Validates uploaded image file size & type.
 */
export const imageSchema = z
  .instanceof(File, { message: "Choose an image to upload" })
  .refine((file) => file.size <= 2 * 1024 * 1024, {
    message: "Image must be smaller than 2MB",
  })
  .refine(
    (file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type),
    { message: "Unsupported format — try JPG, PNG, or GIF 🚀", }
  )
  .optional();



/**
 * Login Form Schema
 * Used to authenticate users
 */
export const signInFormSchema = z.object({
  email: z.email({ error: "Email is required" })
          .min(1, "Email is required"),
  password: z.string({ error: "Password is required" })
    .min(1, "Password is required")
    .min(6, "Password must be more than 6 characters")
    .max(32, "Password must be less than 32 characters"),
})



/**
 * Role Form Schema
 * Used to create/edit a Role
 */
export const roleFormSchema = z.object({
  id: z.union([z.number(), z.string().transform(String)]).optional(),
  role: z.string().min(2).max(50),
})



/**
 * Modules Form Schema
 * Used to create/edit a Module
 */
export const moduleFormSchema = z.object({
  id: z.union([z.number(), z.string().transform(String)]).optional(),
  name: z.string().min(2).max(50),
  label: z.string().min(2).max(50).optional(),
})



/**
 * User Form Schema
 * Used to create/edit a User
 */
export const userFormSchema = z.object({
  id: z.union([z.number(), z.string().transform(String)]).optional(),
  name: z.string().min(2, { error: "Required" }).max(50),
  email: z.email({ error: "A valid email address is required"}),
  password: z.string().min(6, { error: "Password must be greater than 5 characters" }).max(50, { error: "Password must be less than 50 characters" }),
  is_active: z.boolean().optional(),
  role_id: z.string().min(1, { error: "Required"}),
})



/**
 * Permissions Form Schema
 * Used to edit a Permission for specific Role & Module
 */
export const permissionsFormSchema = z.array(
  z.object({
    id: z.union([z.number(), z.string().transform(String)]).optional(),
    role_id: z.number().min(1, { error: "Required" }),
    module_id: z.number().min(1, { error: "Required" }),
    label: z.string().optional(),
    can_view: z.boolean().optional(),
    can_edit: z.boolean().optional(),
    can_create: z.boolean().optional(),
    can_delete: z.boolean().optional(),
  })
);

