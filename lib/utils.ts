import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {format, parse } from 'date-fns'
import numWords from "num-words";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type MappingKeys = {
  label: string;
  value: string;
  badge?: string | null;
};

export function mapToLabelValue<T extends Record<string, any>>(
  data: T[],
  keys: MappingKeys
): { label: string; value: string; badge?: string | null }[] {
  return data.map((item) => {
    const mappedItem: { label: string; value: string; badge?: string | null } = {
      label: String(item[keys.label]),
      value: String(item[keys.value]),
    };

    if (keys.badge) {
      mappedItem.badge = item[keys.badge] != null ? String(item[keys.badge]) : null;
    }

    return mappedItem;
  });
}


// Slugify: lowercase, trim, replace spaces with hyphens, encode URI components but keep &
export const slugify = (text: string) =>
  encodeURIComponent(text.trim().toLowerCase().replace(/\s+/g, '-')).replace(/%26/g, '&');

// Deslugify: lowercase, trim, replace hyphens with spaces, decode URI components, keep &
export const deslugify = (slug: string) =>
  decodeURIComponent(slug.trim().toLowerCase().replace(/-/g, ' '));

// Get last segments into the url (like: '/app/page/roles' -> 'roles') and remove 'roles?q=hello' to 'roles'
export function getLastPathSegment(url: string): string {
  const segments = url.split('/').filter(Boolean);
  if (segments.length === 0) return '';
  return segments[segments.length - 1].split('?')[0].split('#')[0].toLowerCase();
}

export function formatMonthYear(dateString: string) {
  const parsedDate = parse(dateString, 'yyyy-MM', new Date());
  return format(parsedDate, 'MMMM yyyy'); // e.g., "April 2025"
}

// Helper to convert number to capitalized words
export function toCapitalizedWords(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "Zero Rupees";

  const numericValue = Number(value);

  if (isNaN(numericValue)) return "Invalid Amount";

  const isNegative = numericValue < 0;
  const absoluteValue = Math.abs(numericValue);

  const wordString = numWords(absoluteValue);

  if (!wordString || typeof wordString !== 'string') return "Zero Rupees";

  const words = wordString
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return `${isNegative ? 'Negative ' : ''}${words} Rupees`;
}
