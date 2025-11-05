import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserRound } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateWithFns } from '@/lib/date-fns';
import { EmployeeCompleteDetailsInterface } from '@/lib/definations';

// === Interfaces ===
interface InfoProps {
  data: EmployeeCompleteDetailsInterface;
  showSalary: boolean;
}

interface Column {
  key: string;
  label: string;
  className?: string;
}

interface TableRoundedCornerDemoProps {
  columns: Column[];
  value: Record<string, any>[];
}

// === Main Component ===
const Info = ({ data, showSalary }: InfoProps) => {
  // === Table Column Definitions ===
  const employeeRecordsColumns: Column[] = [
    { key: 'designation', label: 'Designation', className: 'min-w-25 font-medium capitalize' },
    { key: 'shift', label: 'Shift', className: 'capitalize' },
    { key: 'status', label: 'Status', className: 'capitalize' },
    { key: 'joinedAt', label: 'Joined Date', className: 'text-right' },
    { key: 'resignedAt', label: 'Resigned Date', className: 'text-center' },
    { key: 'changeType', label: 'Change Type', className: 'capitalize' },
    { key: 'createdAt', label: 'Created Date', className: 'text-right' },
  ];

  const employeeSalaryColumns: Column[] = [
    { key: 'previousSalary', label: 'Previous Salary' },
    { key: 'newSalary', label: 'New Salary' },
    { key: 'changeType', label: 'Change Type', className: 'capitalize min-w-40' },
    { key: 'reason', label: 'Reason', className: 'capitalize md:w-1/2 w-full' },
    { key: 'createdAt', label: 'Created Date', className: 'text-right' },
  ];

  const accordionItems = [
    {
      title: 'Employment Record',
      content: <DataTable columns={employeeRecordsColumns} value={data.employmentRecord} />,
    },
    {
      title: 'Salary Changes',
      content: <DataTable columns={employeeSalaryColumns} value={data.salaryChanges} />,
    },
  ];

  return (
    <>
      {/* === Profile & Details Section === */}
      <div className="flex justify-center p-4">
        <div className="flex w-full flex-col md:flex-row items-center md:items-start gap-6 p-6">
          <ProfileImage imageUrl={data.image} />
          <EmployeeDetails data={data} showSalary={showSalary} />
        </div>
      </div>

      {/* === Accordion Tables === */}
      <Accordion type="single" collapsible className="w-full space-y-2" defaultValue="item-1">
        {accordionItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index + 1}`} className="rounded-md border!">
            <AccordionTrigger className="px-5">{item.title}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground px-5">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
};

// === Reusable Components ===

const ProfileImage = ({ imageUrl }: { imageUrl: string | null }) => {
  return imageUrl ? (
    <div className="relative w-full max-w-[13rem] aspect-square rounded-lg outline outline-border shadow-md overflow-hidden">
      <Image src={imageUrl} alt="Employee profile picture" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 13rem" priority />
    </div>
  ) : (
    <div className="w-full max-w-[13rem] aspect-square rounded-lg bg-neutral-200/75 shadow-md flex items-center justify-center text-neutral-400/80 p-12">
      <UserRound className="w-full h-full" />
    </div>
  );
};

const EmployeeDetails = ({
  data,
  showSalary,
}: {
  data: EmployeeCompleteDetailsInterface;
  showSalary: boolean;
}) => {
  return (
    <div className="flex flex-col items-center md:items-start gap-2 text-foreground text-lg w-full">
      <Detail label="Name" value={data.name} />
      <Detail label="CNIC" value={data.CNIC} />
      <Detail label="Father Name" value={data.fatherName} />
      <Detail label="Current Designation" value={data?.employmentRecord?.[0]?.designation} />
      <Detail label="Email" value={data.email} />
      <Detail label="Phone" value={data.phone} />
      {showSalary && <Detail label="Current Salary" value={data.salary} />}

      <div className="text-center mt-4">
        <Link
          href={`?showSalary=${!showSalary}`}
          className="text-blue-500 hover:underline text-sm"
        >
          {showSalary ? 'Hide Salary' : 'Show Salary'}
        </Link>
      </div>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value?: string | number | null }) => (
  <p>
    {label}: <span className="text-orange-600 dark:text-orange-400 font-normal">{value || 'N/A'}</span>
  </p>
);

// === Data Table Component ===
const DataTable: React.FC<TableRoundedCornerDemoProps> = ({ columns, value }) => {
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead key={idx} className={col.className}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {value.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex} className={col.className}>
                    {getDisplayValue(row[col.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// === Value Formatter ===
const getDisplayValue = (value: any): string => {
  if (value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value))) {
    return '—';
  }

  const isDateLike = (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) || value instanceof Date;

  if (isDateLike) {
    try {
      return formatDateWithFns(value, { separator: '-', showTime: false, monthFormat: 'short', yearFormat: 'long', order: ['DD', 'MMM', 'YYYY'] });
    } catch {
      return 'Invalid date';
    }
  }

  return String(value);
};

export default Info;
