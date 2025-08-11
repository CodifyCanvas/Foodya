import z from "zod";
import { imageSchema } from "./index";

// === Menu Category Form Schema ===
export const menuCategoriesFormSchema = z.object({
  id: z.union([z.number(), z.string().transform(String)]).optional(),
  name: z.string({error: "Name is required"}).min(2, { error: "Name must be at least 2 characters"}).max(50, {error: "Name must not exceed 50 characters"}),
  description: z.string().max(255, { error: "Description must be less than 255 characters" }).optional(),
})

// === Helper that take string into numbers ===
const numberFromString = z
  .union([z.string(), z.number()])
  .transform((val) => Number(val))
  .refine((val) => !isNaN(val), { message: "Must be a number" })
  .refine((val) => val >= 0, { message: "Must be 0 or greater" });

// === Menu Items with Options Form Schema ===
export const menuItemFormSchema = z.object({
  id: z.union([z.number(), z.string().transform(String)]).optional(), 
  image: imageSchema,
  item: z.string().min(1, "Item name is required"),
  category_id: z.string().min(1, {error: "Category is required"}),
  description: z.string().optional(),
  price: numberFromString,
  is_available: z.boolean().optional().default(true),
  options: z
    .array(
      z.object({
        option_name: z.string().min(1, "Option name is required").max(30, { error: "Max 30 characters"}),
        price: numberFromString,
      })
    )
    .optional()
});

// === Restaurant Tables Form Schema === 
export const restaurantTablesFormSchema = z.object({
  id: z.union([z.number(), z.string().transform(String)]).optional(),
  table_number: z.string().min(1).max(50),
  status: z.enum(["occupied", "booked", "available"]),
})

// === bookings Tables Form Schema === 
export const bookingsTablesFormSchema = z.object({
  id: z.union([z.number(),z.string().transform(String)]).optional(),
  tableId: z.string().min(1, { error: "Oops! Please select a table to continue." }),
  customerName: z.string().min(2, { error: "Name needs to be at least 2 characters long." }).max(50, { error: "Whoa, that's a long name! Keep it under 50 characters." }),
  advancePaid: z.string().max(11, { error: "Hmm, that payment amount looks off. Please check again." }).optional(),
  reservationStart: z.date({ error: issue => issue.input === undefined ? "Required" : "Invalid date" }),
  reservationEnd: z.date({ error: issue => issue.input === undefined ? "Required" : "Invalid date" }),
})