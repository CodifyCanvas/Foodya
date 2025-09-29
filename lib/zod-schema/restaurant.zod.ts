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

// === Employee Personal Info Form Schema ===
export const EmployeePersonalInfoFormSchema = z.object({
  id: z.union([z.number(), z.string().transform(String)]).optional().nullable(),
  image: imageSchema,
  name: z.string().min(1, "Name is required").max(50, "Name must be at most 50 characters"),
  CNIC: z.string().min(13, "CNIC must be at least 13 digits").max(15, "CNIC must be at most 15 characters"),
  fatherName: z.string().min(1, "Father name is required").max(50, "Father name must be at most 50 characters"),
  email: z.email("Invalid email address").max(100, "Email must be at most 100 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number must be at most 15 characters"),
});

// === Employment Record Form Schema ===
export const EmploymentRecordFormSchema = z.object({
  designation: z.string().min(1, "Designation is required").max(100, "Designation must be at most 100 characters"),
  shift: z.string().min(1, "Shift is required").max(100, "Shift must be at most 100 characters"),
  status: z.enum(['active', 'resigned', 'terminated', 'rejoined']),
  joinedAt: z.string().min(1, "Join date is required"),
  resignedAt: z.string().nullable(),
  changeType: z.enum(['valid','correction']),
}).check((schema) => {
  const { status, resignedAt} = schema.value;

  if (status === 'resigned' && !resignedAt) {
    schema.issues.push({
      code: "custom",
      message: "Please select the Resign Date",
      path: ["resignedAt"],
      input: resignedAt,
    });
  }

  if (resignedAt && status !== 'resigned') {
    schema.issues.push({
      code: "custom",
      message: "Please select the option to Resign",
      path: ["status"],
      input: status,
    });
  }
});

// === Employee Salary Change Form Schema ===
export const SalaryChangeFormSchema = z.object({
  previousSalary: z.string().transform<string | null>((val) => {
    const num = Number(val);
    return isNaN(num) || num <= 0 ? null : val;
  }).nullable(),
  newSalary: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }, { message: "Value must be a number greater than 0" }),
  reason: z.string().nullable(),
  changeType: z.enum(['initial', 'raise', 'promotion', 'adjustment', 'correction']),
});

// === Full Employee Form Schema ===
export const FullEmployeeFormSchema = z.object({
  personalInfo: EmployeePersonalInfoFormSchema,
  employmentRecord: EmploymentRecordFormSchema,
  salaryChanges: SalaryChangeFormSchema,
});

// === Employee Salaries Posting Form Schema ===
export const EmployeeSalaryPostingFormSchema = z.object({
  salaries: z.array(
    z.object({
      id: z.union([z.number(), z.string().transform(String)]),

      employeeId: z.union([z.number(), z.string().transform(String)]),
      description: z.string().nullable(),

      basicPay: z.string(),
      bonus: z.string().transform((val) => (val?.trim() === "" || val == null ? "0.00" : val)),
      penalty: z.string().transform((val) => (val?.trim() === "" || val == null ? "0.00" : val)),
      totalPay: z.string(),

      month: z.string().regex(/^(19|20)\d{2}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format (e.g., 2025-08)"), // Month in format YYYY-MM
      
      selected: z.boolean(),  // Field to indicate which salaries are selected for payment only

    }).superRefine((row, ctx) => {
      if (!row.selected) return;

      const fields = [
        { key: "basicPay", value: row.basicPay, check: (n: number) => n > 0, message: "Basic pay must be a number greater than 0" },
        { key: "bonus", value: row.bonus, check: (n: number) => n >= 0, message: "Bonus must not be negative" },
        { key: "penalty", value: row.penalty, check: (n: number) => n >= 0, message: "Penalty must not be negative" },
        { key: "totalPay", value: row.totalPay, check: (n: number) => n > 0, message: "Total pay must be a number greater than 0" },
      ];

      for (const field of fields) {
        const num = Number(field.value);
        if (isNaN(num) || !field.check(num)) {
          ctx.addIssue({
            code: "custom",
            path: [field.key],
            message: field.message,
          });
        }
      }
    })
  ).min(1, {
    message: "At least one salary entry is required",
  }),
});

// === Transaction Category Form Schema ===
export const TransactionCategoriesFormSchema = z.object({
  id: z.union([z.number(), z.string().transform(String)]).nullable(),
  category: z.string({ error: "Category Name is required" }).min(2, { error: "Category Name must be at least 2 characters" }).max(50, { error: "Category Name must not exceed 50 characters" }),
  description: z.string().max(255, { error: "Description must be less than 255 characters" }).nullable(),
})