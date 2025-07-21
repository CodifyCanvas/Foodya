import z from "zod";

// Login Form Schema
export const loginSchema = z.object({
  email: z.email({ error: "A valid email address is required to continue." }),
  password: z.string().min(6, { error: "Password must be greater than 5 characters" }).max(50, { error: "Password must be less than 50 characters" }),
})

// Role Form Schema
export const roleFormSchema = z.object({
  id: z.union([z.number(), z.string().transform(String)]).optional(),
  role: z.string().min(2).max(50),
})