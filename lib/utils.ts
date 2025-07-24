import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type MappingKeys = {
  label: string;
  value: string;
};

export function mapToLabelValue<T extends Record<string, any>>(
  data: T[],
  keys: MappingKeys
): { label: string; value: string }[] {
  return data.map((item) => ({
    label: String(item[keys.label]),
    value: String(item[keys.value]),
  }));
}
