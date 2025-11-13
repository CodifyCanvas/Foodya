import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parse } from 'date-fns'
import numWords from "num-words";



/**
 * Combines multiple Tailwind CSS classes and merges conflicting classes intelligently.
 * Uses clsx for conditional merging and tailwind-merge for Tailwind-specific merging.
 * 
 * @param inputs - An array of class names or conditional class expressions.
 * @returns A single merged string of class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



/**
 * Maps an array of objects to a new array with keys renamed to label, value, and optionally badge.
 * Useful for normalizing data to a common format for UI components (e.g., dropdowns).
 * 
 * @param data - Array of objects to map.
 * @param keys - Object specifying keys to extract and rename.
 * @returns Array of objects with `label`, `value`, and optional `badge` fields.
 */
export function mapToLabelValue<
  T,
  L extends keyof T,
  V extends keyof T,
  B extends keyof T | undefined = undefined
>(data: T[], keys: { label: L; value: V; badge?: B; }): { label: string; value: string; badge?: string | null }[] {

  return data.map((item) => {
    const mappedItem: { label: string; value: string; badge?: string | null } = {
      label: String(item[keys.label]),
      value: String(item[keys.value]),
    };

    if (keys.badge) {
      const badgeValue = item[keys.badge];
      mappedItem.badge = badgeValue != null ? String(badgeValue) : null;
    }

    return mappedItem;
  });
}



/**
 * Converts a string into a URL-friendly slug.
 * Lowercases, trims, replaces spaces with hyphens,
 * encodes URI components but keeps ampersands (&) intact.
 * 
 * @param text - The input string to slugify.
 * @returns A URL-friendly slug string.
 */
export const slugify = (text: string) =>
  encodeURIComponent(text.trim().toLowerCase().replace(/\s+/g, '-')).replace(/%26/g, '&');



/**
 * Converts a slug back into a readable string.
 * Lowercases, trims, replaces hyphens with spaces,
 * decodes URI components, keeping ampersands (&) intact.
 * 
 * @param slug - The slug string to deslugify.
 * @returns A human-readable string.
 */
export const deslugify = (slug: string) =>
  decodeURIComponent(slug.trim().toLowerCase().replace(/-/g, ' '));



/**
 * Extracts the last path segment from a URL, excluding query parameters and hash fragments.
 * Converts the result to lowercase.
 * 
 * Example: '/app/page/roles?q=hello' => 'roles'
 * 
 * @param url - The full URL or path string.
 * @returns The last path segment as a lowercase string.
 */
export function getLastPathSegment(url: string): string {
  const segments = url.split('/').filter(Boolean);
  if (segments.length === 0) return '';
  return segments[segments.length - 1].split('?')[0].split('#')[0].toLowerCase();
}



/**
 * Formats a date string in 'YYYY-MM' format into a readable "Month Year" string.
 * Example: '2025-10' => 'October 2025'
 * 
 * @param dateString - A date string starting with 'YYYY-MM'.
 * @returns A formatted string showing full month name and year.
 */
export function formatMonthYear(dateString: string) {
  // Extract first 7 chars for "yyyy-MM"
  const monthStr = dateString.slice(0, 7);
  const parsedDate = parse(monthStr, 'yyyy-MM', new Date());
  return format(parsedDate, 'MMMM yyyy');
}



/**
 * Formats a Date object into a 'YYYY-MM' string.
 * Example: new Date(2025, 8) => '2025-09'
 * 
 * @param date - A JavaScript Date object.
 * @returns A string in 'YYYY-MM' format. e.g., 2025-09.
 */
export function formatMonth(date: Date): string {
  return format(date, "yyyy-MM");
}



/**
 * Validates whether a string matches the 'YYYY-MM' format with valid months (01-12).
 * 
 * @param value - The string to validate.
 * @returns True if valid month-year format, false otherwise.
 */
export const isValidMonthYear = (value: string): boolean => {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
};



/**
 * Converts a number or numeric string into capitalized English words and appends "Rupees".
 * Handles negative numbers, zero, null/undefined and invalid inputs.
 * 
 * @param value - Number, string, null, or undefined input.
 * @returns The amount in capitalized words followed by "Rupees", or appropriate fallback string.
 */
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



/**
 * Returns the current year and month in 'YYYY-MM' format.
 * Suitable as a default value for HTML <input type="month" /> elements.
 * 
 * @returns Current year and month string formatted as 'YYYY-MM'.
 */
export function getCurrentMonthValue(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}` // Format: "YYYY-MM"
}



/**
 * Truncates a given text string to a specified maximum length and appends an ellipsis ("...") if it exceeds that length.
 *
 * @param {string} [text=""] - The input text to be truncated.
 * @param {number} [maxLength=30] - The maximum allowed length of the text before truncation.
 * @returns {string} The truncated text with an ellipsis if it was longer than the specified max length,
 * or the original text if it's within the limit.
 *
 * @example
 * truncateText("Hello world, this is a long sentence.", 15);
 * Returns: "Hello world, thi..."
 */
export const truncateText = (text: string = "", maxLength: number = 30): string => {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};



/**
 * Finds an object in an array by matching a specific key/value pair.
 * @param items - The array of objects
 * @param key - The key of the property to match
 * @param value - The value to match (case-insensitive if string)
 * @returns The matching object or undefined if not found
 */
export function findItemByKey<T, K extends keyof T>(
  items: T[],
  key: K,
  value: T[K]
): T | undefined {
  return items.find(item => {
    const itemValue = item[key];
    if (typeof itemValue === "string" && typeof value === "string") {
      return itemValue.toLowerCase() === value.toLowerCase();
    }
    return itemValue === value;
  });
}