import z from "zod";
import { imageSchema } from "./index";

// === Menu Category Form Schema ===
export const menuCategoriesFormSchema = z.object({
  id: z.union([z.number(), z.string().transform(String)]).optional(),
  name: z.string({ error: "Name is required" }).min(2, { error: "Name must be at least 2 characters" }).max(50, { error: "Name must not exceed 50 characters" }),
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
  category_id: z.string().min(1, { error: "Category is required" }),
  description: z.string().optional(),
  price: numberFromString,
  is_available: z.boolean().optional().default(true),
  options: z
    .array(
      z.object({
        option_name: z.string().min(1, "Option name is required").max(30, { error: "Max 30 characters" }),
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
  id: z.union([z.number(), z.string().transform(String)]).optional(),
  tableId: z.string().min(1, { error: "Oops! Please select a table to continue." }),
  customerName: z.string().min(2, { error: "Name needs to be at least 2 characters long." }).max(50, { error: "Whoa, that's a long name! Keep it under 50 characters." }),
  advancePaid: z.string().max(11, { error: "Hmm, that payment amount looks off. Please check again." }).optional(),
  reservationStart: z.date({ error: issue => issue.input === undefined ? "Required" : "Invalid date" }),
  reservationEnd: z.date({ error: issue => issue.input === undefined ? "Required" : "Invalid date" }),
})

// === Invoices (Generate Invoice from Orders Page) Form Schema === 
export const invoiceFormSchema = z.object({
  customerName: z.string().max(50, { error: "Whoa, that's a long name! Keep it under 50 characters." }).optional(),
  paymentMethod: z.enum(["cash", "card", "online"]),
  orderType: z.enum(["dine_in", "drive_thru", "takeaway"]),
  subTotalAmount: z.string().max(11, { error: "Hmm, that sub total amount looks off. Please check again." }),
  discount: z.string().max(11, { error: "Hmm, that discount percentage amount looks off. Please check again." }),
  totalAmount: z.string().max(11, { error: "Hmm, that total amount looks off. Please check again." }),
  advancePaid: z.string().max(11, { error: "Hmm, that advance paid amount looks off. Please check again." }),
  grandTotal: z.string().max(11, { error: "Hmm, that grand total amount looks off. Please check again." }),
})

// === Invoices (create/edit) Form Schema === 
export const invoiceActionFormSchema = z.object({
  // === Invoice Info ===
  invoiceId: z.union([z.number(), z.string().transform(String)]).optional(),
  customerName: z.string().max(50, { error: "Whoa, that's a long name! Keep it under 50 characters." }).optional(),
  paymentMethod: z.enum(["cash", "card", "online"]).nullable(),
  isPaid: z.boolean(),
  invoiceCreatedAt: z.preprocess((val) => typeof val === "string" || val instanceof Date ? new Date(val) : val, z.date({ error: issue => issue.input === undefined ? "Required" : "Invalid date" })),

  // === Order Info ===
  orderId: z.union([z.number(), z.string().transform(String)]).optional(),
  tableId: z.string().optional().nullable(),
  waiterId: z.string().optional().nullable(),
  orderType: z.enum(["dine_in", "drive_thru", "takeaway"]),
  orderCreatedAt: z.preprocess((val) => typeof val === "string" || val instanceof Date ? new Date(val) : val, z.date({ error: issue => issue.input === undefined ? "Required" : "Invalid date" })),

  // === Order Items ===
  orderItems: z
    .array(
      z.object({
        menuItemImage: z.string().nullable().optional(),
        menuItemId: z.string().min(1, { error: "Select an item" }),
        menuItemName: z.string().max(30, { error: "Max 30 characters" }),
        menuItemOptionId: z.string().nullable().default(null),
        menuItemOptionName: z.string().max(30, { error: "Max 30 characters" }).nullable().default(null),
        quantity: numberFromString,
        price: z.coerce.string().refine(val => !isNaN(parseFloat(val)), { message: "Price must be a number" }).transform(val => parseFloat(val).toFixed(2)),
      })
    )
    .min(1, { error: 'Add Items in the invoice' }),

  // === Pricing Info ===
  subTotalAmount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, { message: "Subtotal must be greater than 0" }).transform(val => parseFloat(val).toFixed(2)),
  discount: z.string().refine(val => !isNaN(parseFloat(val)), { message: "Discount must be a number" }).transform(val => parseFloat(val).toFixed(2)),
  totalAmount: z.string().refine(val => !isNaN(parseFloat(val)), { message: "Total must be a number" }).transform(val => parseFloat(val).toFixed(2)),
  advancePaid: z.string().refine(val => !isNaN(parseFloat(val)), { message: "Advance must be a number" }).transform(val => parseFloat(val).toFixed(2)),
  grandTotal: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, { message: "Grand total must be 0 or more" }).transform(val => parseFloat(val).toFixed(2)),
}).check((schema) => {
  const { isPaid, paymentMethod, orderType, waiterId, tableId } = schema.value;

  if (isPaid && !paymentMethod) {
    schema.issues.push({
      code: "custom",
      message: "Payment method is required when invoice is paid.",
      path: ["paymentMethod"],
      input: paymentMethod,
    });
  }

  if (orderType === "dine_in") {
    if (!tableId) {
      schema.issues.push({
        code: "custom",
        message: "Select the table",
        path: ["tableId"],
        input: tableId,
      });
    }

    if (!waiterId) {
      schema.issues.push({
        code: "custom",
        message: "Select the waiter",
        path: ["waiterId"],
        input: waiterId,
      });
    }
  }
}).transform((data) => {
  return {
    ...data,
    paymentMethod: data.isPaid
      ? data.paymentMethod ?? "cash"
      : null,
    tableId: data.orderType === "dine_in" ? data.tableId : "",
    waiterId: data.orderType === "dine_in" ? data.waiterId : "",
  };
});