import { fetchEmployee } from '@/lib/crud-actions/employees';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Info from './info';
import SalaryHistory from './salaries';
import { EmployeeCompleteDetailsInterface } from '@/lib/definations';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page = async ({ params, searchParams }: PageProps) => {

  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const employee: EmployeeCompleteDetailsInterface | null = await fetchEmployee(Number(id));

  if (!employee) {
    throw new Error(`Employee with ID ${id} not found`);
  }

  const showSalary = resolvedSearchParams.showSalary === 'true';

  const tabs = [
  {
    name: 'Info',
    value: 'info',
    content: <Info data={employee} showSalary={showSalary}  />
  },
  {
    name: 'Salaries',
    value: 'salaries',
    content: <SalaryHistory />
  }
]

  return (
    <div className="bg-white rounded-lg font-rubik h-full flex flex-1 flex-col p-4">
      <h1 className="text-2xl font-normal mb-4">Employee Details</h1>
      {/* <pre className="bg-gray-100 p-4 rounded-md">{JSON.stringify(employee, null, 2)}</pre> */}

      <div className='w-full'>
      <Tabs defaultValue='info' className='gap-4'>
        <TabsList className='bg-background rounded-none border-b p-0'>
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className='bg-background data-[state=active]:text-emerald-600 text-neutral-500 data-[state=active]:border-emerald-600 h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none'
            >
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => (
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
