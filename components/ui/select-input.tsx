'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Option = {
  label: string;
  value: string | number;
};

type SelectInputProps = {
  value?: string | number;
   onChange: (value: string | number | undefined) => void;
  className?: string
  onBlur?: () => void;
  name: string;
  options: Option[];
  placeholder?: string;
};

const SelectInput = ({
  value = '',
  onChange,
  className,
  onBlur,
  name,
  options,
  placeholder = 'Select an option',
}: SelectInputProps) => {
  return (
    <Select value={value !== undefined ? String(value) : ''} onValueChange={(val) => onChange(val === '' ? undefined : Number(val))}  name={name}>
      <SelectTrigger
        className={cn(
          'flex h-10 font-rubik-400 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1', className
        )}
      >
        <SelectValue placeholder={placeholder}/>
      </SelectTrigger>
      <SelectContent className='font-rubik-400'>
        <SelectGroup>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectInput;
