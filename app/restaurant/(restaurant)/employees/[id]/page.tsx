import React, { Suspense } from 'react';
import Link from 'next/link';
import { CornerUpLeft, Loader } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Info from './info';
import SalaryHistory from './salaries';

import { EmployeeCompleteDetailsInterface } from '@/lib/definations';
import { isValidMonthYear } from '@/lib/utils';
import { fetchEmployee } from '@/lib/crud-actions/employees';
import { notFound } from 'next/navigation';

// === Props Interface ===
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// === Main Page Component ===
const Page = async ({ params, searchParams }: PageProps) => {
  // Await params and searchParams once to avoid multiple awaits
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const employee: EmployeeCompleteDetailsInterface | null = await fetchEmployee(Number(id));

  // === Error Handling ===
  if (!employee) {
    console.warn(`Employee not found. ID: ${id}`);
    notFound();
  }

  // === Search Params Processing ===
  const showSalary = resolvedSearchParams.showSalary === 'true';
  const rawStatus = resolvedSearchParams.status;
  const rawFrom = resolvedSearchParams.from;
  const rawTo = resolvedSearchParams.to;

  // === Status Validation ===
  type StatusType = 'pending' | 'paid' | 'all';
  const validStatuses: StatusType[] = ['paid', 'pending', 'all'];
  const status: StatusType = validStatuses.includes(rawStatus as StatusType)
    ? (rawStatus as StatusType)
    : 'all';

  // === Date Validation ===
  const from = typeof rawFrom === 'string' && isValidMonthYear(rawFrom) ? rawFrom : undefined;
  const to = typeof rawTo === 'string' && isValidMonthYear(rawTo) ? rawTo : undefined;

  // === Tabs Configuration ===
  const tabs = [
    {
      name: 'Info',
      value: 'info',
      content: (
        <Suspense
          fallback={
            <div className="flex-1 h-full w-full bg-white flex justify-center items-center">
              <Loader className="animate-spin size-7 text-gray-500" />
            </div>
          }
        >
          <Info data={employee} showSalary={showSalary} />
        </Suspense>
      ),
    },
    {
      name: 'Salaries',
      value: 'salaries',
      content: (
        <Suspense
          fallback={
            <div className="flex-1 h-full w-full bg-white flex justify-center items-center">
              <Loader className="animate-spin size-7 text-gray-500" />
            </div>
          }
        >
          <SalaryHistory data={employee} from={from} to={to} status={status} />
        </Suspense>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg font-rubik h-full flex flex-1 flex-col p-4">
      {/* Back Button & Header */}
      <div className="flex flex-col gap-2">
        <Link
          href="/restaurant/employees"
          className="flex flex-row gap-2 items-center py-1 px-2 bg-neutral-100 text-black shadow-xs rounded-full w-fit hover:bg-neutral-200/75"
          aria-label="Back to Employees List"
        >
          <CornerUpLeft size={18} />
          Back
        </Link>
        <h1 className="text-2xl mt-2 font-normal mb-4">Employee Details</h1>
      </div>

      {/* Tabs Section */}
      <div className="w-full">
        <Tabs defaultValue="info" className="gap-4">
          <TabsList className="bg-background rounded-none border-b p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="bg-background data-[state=active]:text-emerald-600 text-neutral-500 data-[state=active]:border-emerald-600 h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
