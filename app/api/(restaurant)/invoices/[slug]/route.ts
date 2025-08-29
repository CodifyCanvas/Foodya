"use server";

import { auth } from "@/auth";
import { checkDuplicate } from "@/lib/crud-actions/general-actions";
import { fetchInvoice, upsertInvoiceOrderItemsTx } from "@/lib/crud-actions/invoices";
import { invoiceActionFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server";

/* ======================================
  === [GET] Fetch All Menu and Its items from DB ===
========================================= */
const path = '/api/invoices/[invoiceId]'
export async function GET(req: NextRequest, { params }: { params: { slug: number } }) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { slug } = await params;

    const invoice = await fetchInvoice(slug);

    return NextResponse.json(invoice, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch order and its items:`, error);

    return NextResponse.json(
      { error: "Failed to fetch order and items. Please try again later." },
      { status: 500 }
    );
  }
}

/* ========================================
=== [POST] Create a New Invoice + Order + Order Items Entry ===
========================================= */
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // === Authenticate the user session === 
    const session = await auth();
    const userId = Number(session?.user.id);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Validate slug parameter === 
    const { slug } = await params;
    if (slug !== 'create') {
      return NextResponse.json(
        { message: "Invalid API endpoint. Please verify the URL and try again." },
        { status: 400 }
      );
    }

    // === Parse and validate request body === 
    const body = await req.json();
    const parsed = invoiceActionFormSchema.parse(body);

    // === Check for duplicate orderId in Invoices table === 
    const duplicate = await checkDuplicate("InvoicesTable", "orderId", parsed.orderId);
    if (duplicate) {
      return NextResponse.json(
        { message: "This order id is already in use." },
        { status: 409 }
      );
    }
    
   // === Create order + items + invoice inside a transaction === 
    const newInvoiceId = await upsertInvoiceOrderItemsTx(parsed, userId, 'insert');

    // === Return success response with invoice ID === 
    return NextResponse.json(
      { message: "Invoice created successfully.", NewinvoiceId: newInvoiceId },
      { status: 201 }
    );

  } catch (error) {
    // === Catch and log any unexpected errors === 
    console.error(`[POST /api/invoices/[slug]] Invoice creation failed:`, error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while creating the order & invoice. Please try again later.",
      },
      { status: 500 }
    );
  }
}

/* =======================================================
=== [PUT] Update an Existing Invoice + Order + Items ===
======================================================= */
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await auth();
    const userId = Number(session?.user.id);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Validate slug parameter === 
    const { slug } = await params;
    if (slug !== 'update') {
      return NextResponse.json(
        { message: "Invalid API endpoint. Please verify the [Slug] and try again." },
        { status: 400 }
      );
    }

    // === Parse and validate request body === 
    const body = await req.json();
    const parsed = invoiceActionFormSchema.parse(body);
    
    const updateInvoiceId = await upsertInvoiceOrderItemsTx(parsed, userId, 'update');

    return NextResponse.json({ message: "Menu item updated successfully.", UpdateInvoiceId: updateInvoiceId }, { status: 202 });
  } catch (error) {
    console.error(`[PUT /api/menu-items] menu item update failed:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating the menu item." },
      { status: 500 }
    );
  }
}