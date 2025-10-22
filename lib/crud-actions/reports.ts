"use server";

import { schema } from "@/lib/drizzle-schema";
import { db } from "../db";
import { and, count, desc, eq, gt, gte, like, lt, lte, or } from "drizzle-orm";
import { addMonths, eachMonthOfInterval, format, endOfMonth, startOfMonth, subMonths } from "date-fns";
import { FinancialChartResponse, ReportsMetricCard, TransactionsReportResult } from "../definations";



// === Drizzle table schemas ===
const transactions = schema.transactionsTable;
const transactionsCategories = schema.transactionCategoriesTable;
const employeesTable = schema.employeesTable;



/**
 * === Fetches high-level dashboard metrics for the current month ===
 * 
 * including:
 * - Total revenue and expenses (with percent change vs last month)
 * - Total and active employees
 * 
 * Returns metric card data suitable for dashboard UI display, including
 * trend indicators and formatted values.
 * 
 * @returns {Promise<ReportsMetricCard[]>} An array of metric card objects with titles, values, trends, and descriptions.
 */
export const getHeaderCardMetrics = async (): Promise<ReportsMetricCard[]> => {
  const now = new Date();

  // === Define Date Ranges ===
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // === Helper - Sum Transactions ===
  const sumTransactionAmounts = (rows: { amount: string }[]) =>
    rows.reduce((sum, txn) => sum + (parseFloat(txn.amount) || 0), 0);

  // === Case-01: Revenue Calculations ===
  const [currentRevenueRows, lastRevenueRows] = await Promise.all([
    db
      .select({ amount: transactions.amount })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, "credit"),
          gte(transactions.createdAt, thisMonthStart),
          lte(transactions.createdAt, thisMonthEnd)
        )
      ),

    db
      .select({ amount: transactions.amount })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, "credit"),
          gte(transactions.createdAt, lastMonthStart),
          lte(transactions.createdAt, lastMonthEnd)
        )
      ),
  ]);

  const currentRevenue = sumTransactionAmounts(currentRevenueRows);
  const lastRevenue = sumTransactionAmounts(lastRevenueRows);
  const revenueChangePercent = lastRevenue > 0
    ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
    : 0;
  const revenueTrend =
    revenueChangePercent >= 0
      ? "Trending up this month"
      : "Down from last month";

  // === Case-02: Expense Calculations ===
  const [currentExpenseRows, lastExpenseRows] = await Promise.all([
    db
      .select({ amount: transactions.amount })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, "debit"),
          gte(transactions.createdAt, thisMonthStart),
          lte(transactions.createdAt, thisMonthEnd)
        )
      ),

    db
      .select({ amount: transactions.amount })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, "debit"),
          gte(transactions.createdAt, lastMonthStart),
          lte(transactions.createdAt, lastMonthEnd)
        )
      ),
  ]);

  const currentExpense = sumTransactionAmounts(currentExpenseRows);
  const lastExpense = sumTransactionAmounts(lastExpenseRows);
  const expenseChangePercent = lastExpense > 0
    ? ((currentExpense - lastExpense) / lastExpense) * 100
    : 0;
  const expenseTrend =
    expenseChangePercent >= 0
      ? "Expenses increased this month"
      : "Spending reduced compared to last month";

  // === Case-03: Employee Stats [Fetch All/Active Employees] ===
  const [totalEmployees, activeEmployees] = await Promise.all([
    db.select({ total: count() }).from(employeesTable),
    db
      .select({ total: count() })
      .from(employeesTable)
      .where(gt(employeesTable.salary, "0.00")),
  ]);

  const totalEmployeesCount = totalEmployees[0]?.total ?? 0;
  const activeEmployeesCount = activeEmployees[0]?.total ?? 0;

  // === Prepare Metric Card Data ===
  const metrics = [
    {
      title: "Total Revenue",
      value: currentRevenue.toFixed(2),
      currency: true,
      change: `${revenueChangePercent >= 0 ? "+" : ""}${revenueChangePercent.toFixed(1)}%`,
      trend: revenueTrend,
      description: "Revenue for the current month",
    },
    {
      title: "Total Expense",
      value: currentExpense.toFixed(2),
      currency: true,
      change: `${expenseChangePercent >= 0 ? "+" : ""}${expenseChangePercent.toFixed(1)}%`,
      trend: expenseTrend,
      description: "Expenses for the current month",
    },
    {
      title: "Total Employees",
      value: totalEmployeesCount.toString(),
      description: "Total onboarded employees",
    },
    {
      title: "Active Employees",
      value: activeEmployeesCount.toString(),
      description: "Employees actively working",
    },
  ];

  return metrics;
};



/**
 * === Loads income and expense data for either a given month or year. ===
 * 
 * Returns an array of date-indexed financial values, along with a summary object.
 * 
 * @param {"month" | "year"} view - The granularity of the chart ("month" or "year").
 * @param {string} duration - A string representing the period:
 *   - "YYYY-MM" for month view (e.g., "2025-10")
 *   - "YYYY" for year view (e.g., "2025")
 * 
 * @returns {Promise<FinancialChartResponse>} A promise that resolves to financial chart data and summary.
 */
export const loadFinancialChartData = async (view: "month" | "year", duration: string): Promise<FinancialChartResponse> => {

  switch (view) {

    // === Case-01: Handle Monthly View ===
    case "month": {
      const [year, month] = duration.split("-");
      if (!year || !month || isNaN(+year) || isNaN(+month)) {
        throw new Error("Invalid month format. Must be 'YYYY-MM'.");
      }

      const startDate = new Date(`${year}-${month}-01`);
      const endDate = addMonths(startDate, 1);

      // === Fetch transactions for the selected month ===
      const rows = await db
        .select({
          type: transactions.type,
          amount: transactions.amount,
          createdAt: transactions.createdAt,
        })
        .from(transactions)
        .where(
          and(
            gte(transactions.createdAt, startDate),
            lt(transactions.createdAt, endDate)
          )
        );

      // === Initialize Map for each day ===
      const dailyMap = new Map<string, { income: number; expense: number }>();
      let totalIncome = 0;
      let totalExpense = 0;

      for (const row of rows) {
        const dateKey = format(new Date(row.createdAt), "yyyy-MM-dd");
        const amount = parseFloat(row.amount);

        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, { income: 0, expense: 0 });
        }

        const entry = dailyMap.get(dateKey)!;

        if (row.type === "credit") {
          entry.income += amount;
          totalIncome += amount;
        } else if (row.type === "debit") {
          entry.expense += amount;
          totalExpense += amount;
        }
      }

      // === Fill in days with no transactions ===
      const daysInMonth = new Date(+year, +month, 0).getDate();
      const data = Array.from({ length: daysInMonth }, (_, i) => {
        const day = String(i + 1).padStart(2, "0");
        const date = `${year}-${month}-${day}`;
        const values = dailyMap.get(date) ?? { income: 0, expense: 0 };

        return {
          date,
          income: values.income.toFixed(2),
          expense: values.expense.toFixed(2),
        };
      });

      const summary = {
        incomes: totalIncome.toFixed(2),
        expense: totalExpense.toFixed(2),
        revenue: (totalIncome - totalExpense).toFixed(2),
      };

      return { data, summary };
    }

    // === Case-02: Handle Yearly View ===
    case "year": {
      const yearNum = parseInt(duration, 10);
      if (isNaN(yearNum)) {
        throw new Error("Invalid year. Must be YYYY.");
      }

      const startOfYear = new Date(`${duration}-01-01`);
      const endOfYear = new Date(`${duration}-12-31`);
      const startOfNextYear = addMonths(startOfYear, 12);

      // === Fetch transactions for the entire year ===
      const rows = await db
        .select({
          type: transactions.type,
          amount: transactions.amount,
          createdAt: transactions.createdAt,
        })
        .from(transactions)
        .where(
          and(
            gte(transactions.createdAt, startOfYear),
            lt(transactions.createdAt, startOfNextYear)
          )
        );

      // === Initialize Map for each month ===
      const months = eachMonthOfInterval({ start: startOfYear, end: endOfYear });
      const monthlyMap = new Map<string, { income: number; expense: number }>();

      for (const month of months) {
        const key = format(month, "yyyy-MM");
        monthlyMap.set(key, { income: 0, expense: 0 });
      }

      let totalIncome = 0;
      let totalExpense = 0;

      for (const row of rows) {
        const dateKey = format(new Date(row.createdAt), "yyyy-MM");
        const amount = parseFloat(row.amount);

        const entry = monthlyMap.get(dateKey);
        if (entry) {
          if (row.type === "credit") {
            entry.income += amount;
            totalIncome += amount;
          } else if (row.type === "debit") {
            entry.expense += amount;
            totalExpense += amount;
          }
        }
      }

      const data = Array.from(monthlyMap.entries())
        .map(([month, values]) => ({
          date: `${month}-01`,
          income: values.income.toFixed(2),
          expense: values.expense.toFixed(2),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const summary = {
        incomes: totalIncome.toFixed(2),
        expense: totalExpense.toFixed(2),
        revenue: (totalIncome - totalExpense).toFixed(2),
      };

      return { data, summary };
    }

    // === Case-03: Invalid View Fallback ===
    default:
      throw new Error("Invalid view parameter. Only 'month' or 'year' is supported.");
  }
};



/**
 * === Fetch paginated transactions with optional search filtering. ===
 * 
 * Retrieves a paginated list of transactions, optionally filtered by a search term.
 * Also calculates the total number of matching records and total pages.
 *
 * @param searchTerm - Filter transactions by title or description (optional).
 * @param pageNumber - Current page number (1-based).
 * @param pageSize - Number of records per page.
 * @returns {Promise<TransactionsReportResult>} A structured transaction report including pagination data.
 * 
 * @example 
 * const result = await getTransactionsForReports("salary", 1, 10);
 */
export const getTransactionsForReports = async (
  searchTerm: string = "",
  pageNumber: number,
  pageSize: number
): Promise<TransactionsReportResult> => {

  // === Calculate offset for pagination ===
  const offset = (pageNumber - 1) * pageSize;

  // === Build where clause for search ===
  const whereClause = searchTerm
    ? or(
      like(transactions.id, `%${searchTerm}%`),
      like(transactions.title, `%${searchTerm}%`),
      like(transactions.description, `%${searchTerm}%`),
      like(transactions.amount, `%${searchTerm}%`),
      like(transactions.type, `%${searchTerm}%`),
      like(transactions.sourceType, `%${searchTerm}%`),
    )
    : undefined;

  // === Get total count (with filter if needed) ===
  const totalResult = await db
    .select({ total: count() })
    .from(transactions)
    .where(whereClause);

  const totalRecords = totalResult[0]?.total ?? 0;

  // === Get paginated transactions with join ===
  const data = await db
    .select({
      id: transactions.id,
      title: transactions.title,
      description: transactions.description,
      amount: transactions.amount,
      categoryId: transactions.categoryId,
      category: transactionsCategories.category,
      categoryDescription: transactionsCategories.description,
      type: transactions.type,
      sourceType: transactions.sourceType,
      sourceId: transactions.sourceId,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .leftJoin(transactionsCategories, eq(transactions.categoryId, transactionsCategories.id))
    .where(whereClause)
    .limit(pageSize)
    .offset(offset)
    .orderBy(desc(transactions.id));

  // === Calculate total pages based on total records and page size ===
  const totalPages = Math.ceil(totalRecords / pageSize);

  // === Normalize the transactions ===
  const mappedData = data.map((txn) => ({
    ...txn,
    createdAt: txn.createdAt.toISOString(),
  }));

  // === Return structured result ===
  return {
    query: searchTerm || null,
    totalRecords,
    page: pageNumber,
    totalPages,
    pageSize,
    transactions: mappedData,
  };
};