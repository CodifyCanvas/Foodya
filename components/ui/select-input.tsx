// SelectInput.tsx
'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Option = {
  label: string;
  value: string;
};

type SelectInputProps = {
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
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
    <Select
      value={value ?? ''}
      onValueChange={(val) => onChange(val === '' ? undefined : val)}
    >
      <SelectTrigger
        className={cn(
          'flex h-10 font-rubik-400 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="font-rubik-400">
        <SelectGroup>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectInput;
