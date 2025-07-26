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

// Get last segments into the url (like: '/app/page/roles' -> 'roles') and remove 'roles?q=hello' to 'roles'
export function getLastPathSegment(url: string): string {
  const segments = url.split('/').filter(Boolean);
  if (segments.length === 0) return '';
  return segments[segments.length - 1].split('?')[0].split('#')[0].toLowerCase();
}
