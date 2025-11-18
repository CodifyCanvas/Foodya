import { auth } from "@/auth";
import { checkDuplicate } from "@/lib/crud-actions/general-actions";
import { deleteInvoiceWithTransaction, fetchInvoice, upsertInvoiceOrderItemsTx } from "@/lib/crud-actions/invoices";
import { invoiceActionFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/invoices/[slug]';



/* =======================================================================
=== [GET] Fetch Specific Invoice by Id with Linked Order + Order Items ===
======================================================================= */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: number }> }) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Validate slug parameter === 
    const { slug: invoiceId } = await params;
    if (!invoiceId || isNaN(Number(invoiceId))) {
      return NextResponse.json(
        { error: "Invalid invoice ID. Please verify the URL and try again." },
        { status: 400 }
      );
    }

    const invoice = await fetchInvoice(invoiceId);

    return NextResponse.json(invoice, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch invoice:`, error);

    return NextResponse.json(
      { error: "Failed to load invoice. Please try again later." },
      { status: 500 }
    );
  }
}



/* =========================================================
=== [POST] Create Invoice + Order + Order Items (Atomic) ===
========================================================= */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    // === Authenticate the user session === 
    const session = await auth();
    const userId = Number(session?.user.id);

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Validate slug parameter === 
    const { slug } = await params;
    if (slug !== 'create') {
      return NextResponse.json(
        { error: "Invalid API endpoint. Please verify the [Slug] and try again." },
        { status: 400 }
      );
    }

    // === Parse and validate request body === 
    const body = await req.json();

    const parsed = invoiceActionFormSchema.parse(body);

    // === Check for duplicate order ID ===
    const duplicate = await checkDuplicate("InvoicesTable", "orderId", Number(parsed.orderId));
    if (duplicate) {
      return NextResponse.json(
        { error: "This order id is already in use." },
        { status: 409 }
      );
    }

    // === Create Invoice + Order + Items Transactionally ===
    const newInvoiceId = await upsertInvoiceOrderItemsTx(parsed, userId, 'insert');


    // === Return success response with invoice ID === 
    return NextResponse.json(
      { message: "Invoice created successfully.", invoiceId: newInvoiceId },
      { status: 201 }
    );

  } catch (error) {
    console.error(`[POST ${path}] Invoice creation failed:`, error);

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the invoice. Please try again later." },
      { status: 500 }
    );
  }
}



/* ============================================================
=== [PUT] Update Invoice + Order + Items (Atomic Operation) ===
============================================================ */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    const userId = Number(session?.user.id);

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Validate slug parameter === 
    const { slug } = await params;
    if (slug !== 'update') {
      return NextResponse.json(
        { error: "Invalid API endpoint. Please verify the [Slug] and try again." },
        { status: 400 }
      );
    }

    // === Parse and validate request body === 
    const body = await req.json();
    const parsed = invoiceActionFormSchema.parse(body);

    const updateInvoiceId = await upsertInvoiceOrderItemsTx(parsed, userId, 'update');

    return NextResponse.json({ message: "Menu item updated successfully.", UpdateInvoiceId: updateInvoiceId }, { status: 202 });
  } catch (error) {
    console.error(`[PUT ${path}] Invoice update failed:`, error);

    return NextResponse.json(
      { error: "An unexpected error occurred while updating the invoice. Please try again later." },
      { status: 500 }
    );
  }
}



/* ============================
=== [Delete] Delete Invoice ===
============================ */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Validate slug parameter === 
    const { slug } = await params;
    const invoiceId = Number(slug);

    if (!invoiceId || typeof invoiceId !== "number" || isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid or missing invoice ID." }, { status: 400 });
    }

    // === Perform Delete Action ===
    await deleteInvoiceWithTransaction(invoiceId);

    // === Return Success Response ===
    return NextResponse.json({ message: "Invoice deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error(`[DELETE ${path}] Failed to delete invoice: `, error);

    // === Custom Error Messages ===
    const message = (error as Error)?.message ?? "Unexpected error";

    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Unable to delete the invoice at this time. Please try again later." },
      { status: 500 }
    );
  }
}