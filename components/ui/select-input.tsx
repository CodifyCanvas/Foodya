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
  optDisabled?: boolean;
  optHide?: boolean;
};

type SelectInputProps = {
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
  disabled?: boolean;
  onBlur?: () => void;
  name?: string;
  id?: string;
  required?: boolean;
  options: Option[];
  placeholder?: string;
};

const SelectInput = ({
  value = '',
  onChange,
  className,
  disabled,
  onBlur,
  name,
  id,
  required = false,
  options,
  placeholder = 'Select an option',
}: SelectInputProps) => {
  return (
    <Select
      value={value ?? ''}
      onValueChange={(val) => onChange(val === '' ? undefined : val)}
      required={required}
      disabled={disabled}
      
    >
      <SelectTrigger
      id={id}
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
            <SelectItem key={opt.value} value={opt.value} disabled={opt.optDisabled} hidden={opt.optHide}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectInput;
