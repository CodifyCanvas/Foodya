"use client"

import { Bar, BarChart, CartesianGrid, TooltipProps, XAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { formatMonthYear, getCurrentMonthValue, toCapitalizedWords } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { FinancialChartResponse } from "@/lib/definations"
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent"

type ChartViewModes = "month" | "year";

// === Chart color config (bar color per metric) ===
const chartConfig = {
  expense: {
    label: "Expense",
    color: "oklch(75% 0.183 55.934)",
  },
  income: {
    label: "Income",
    color: "oklch(59.6% 0.145 163.225)",
  },
} satisfies ChartConfig

export function ChartBarStacked() {

  // === State & Refs ===
  const [viewMode, setViewMode] = useState<ChartViewModes>("month");
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthValue);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [fetchedData, setFetchedData] = useState<FinancialChartResponse>();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // === Fetch chart data on viewMode or duration change (debounced) ===
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      async function fetchChartData() {
        try {
          const response = await fetch("/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              view: viewMode,
              duration: viewMode === "month" ? selectedMonth : selectedYear,
            }),
          });

          const result = await response.json();
          setFetchedData(result);
        } catch (error) {
          console.error("Failed to fetch chart data:", error);
        }
      }

      fetchChartData();
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [viewMode, selectedMonth, selectedYear]);

  // === Filter date ticks for X axis to show only on 7th, 14th, 21st, 28th (monthly view) ===
  const ticks = (fetchedData?.data ?? [])
    .filter(({ date }) => {
      const day = new Date(date).getDate();
      return day === 7 || day === 14 || day === 21 || day === 28;
    })
    .map(({ date }) => date);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income / Expense Chart</CardTitle>
        <CardDescription>
          {viewMode === "year"
            ? `January - December ${selectedYear}`
            : formatMonthYear(selectedMonth)}
        </CardDescription>

        <CardAction>
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ChartViewModes)} variant="outline" className="*:data-[slot=toggle-group-item]:!px-4 pb-2 w-44" >
            <ToggleGroupItem value="month">Month</ToggleGroupItem>
            <ToggleGroupItem value="year">Year</ToggleGroupItem>
          </ToggleGroup>

          {viewMode === "month" ? (
            <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-44" />
          ) : (
            <Input type="number" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} min="2000" max="2100" placeholder="Select year" className="w-44" />
          )}

        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full max-h-96">

          <BarChart accessibilityLayer data={fetchedData?.data ?? []}>
            <CartesianGrid vertical={false} />

            <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} ticks={ticks} tickFormatter={formatDate} />

            <ChartTooltip content={(e) => CustomTooltipContent(e, viewMode)} />

            <ChartLegend content={<ChartLegendContent />} />

            <Bar dataKey="expense" stackId="a" fill="var(--color-expense)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="income" stackId="a" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col  items-start gap-2 text-sm">

        {/* Income */}
        <Tooltip>
          <TooltipTrigger>
            <div className="flex gap-2 leading-none text-neutral-500 text-center cursor-default">
              Income: {fetchedData?.summary?.incomes ?? "0.00"} PKR
            </div>
          </TooltipTrigger>
          {fetchedData?.summary?.incomes && (
            <TooltipContent className="text-sm max-w-xs text-center">
              <p>{toCapitalizedWords(fetchedData?.summary?.incomes)}</p>
            </TooltipContent>
          )}
        </Tooltip>

        {/* Expense */}
        <Tooltip>
          <TooltipTrigger>
            <div className="flex gap-2 leading-none text-neutral-500 text-center cursor-default">
              Expense: {fetchedData?.summary?.expense ?? "0.00"} PKR
            </div>
          </TooltipTrigger>
          {fetchedData?.summary?.expense && (
            <TooltipContent className="text-sm max-w-xs text-center">
              <p>{toCapitalizedWords(fetchedData?.summary?.expense)}</p>
            </TooltipContent>
          )}
        </Tooltip>

        {/* Revenue (with color based on positive/negative) */}
        <Tooltip>
          <TooltipTrigger>
            <div className={`flex gap-2 leading-none ${Number(fetchedData?.summary?.revenue) >= 0 ? 'text-emerald-500' : 'text-red-500' } font-medium text-center cursor-default`} >
              Revenue: {fetchedData?.summary?.revenue ?? "0.00"} PKR
            </div>
          </TooltipTrigger>
          {fetchedData?.summary?.revenue && (
            <TooltipContent className="text-sm max-w-xs text-center">
              <p>{toCapitalizedWords(fetchedData?.summary?.revenue)}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </CardFooter>
    </Card>
  )
}

// === Tooltip content for chart hover ===
function CustomTooltipContent( props: TooltipProps<ValueType, NameType>, mode: "month" | "year") {
  
  const { active, payload, label } = props;

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formattedDate = new Date(label as string).toLocaleDateString(undefined, {
    day: mode === "month" ? "2-digit" : undefined,
    weekday: mode === "month" ? "short" : undefined,
    month: mode === "month" ? "short" : "long",
    year: mode === "month" ? "2-digit" : "numeric",
  });

  return (
    <div className="custom-tooltip bg-white p-2 rounded border shadow">
      <p className="label font-bold">{formattedDate}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey?.toString()} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}
