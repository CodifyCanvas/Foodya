import { parseISO, format } from 'date-fns';

type DateFormatPart = 'DD' | 'MM' | 'MMM' | 'YYYY';

interface FormatDateOptions {
  showTime?: boolean;
  separator?: '-' | '/' | '.' | ',';
  monthFormat?: 'short' | 'long';
  yearFormat?: 'short' | 'long';
  order?: DateFormatPart[];
}

/**
 * Formats a given ISO date string or Date object into a custom format.
 */
export function formatDateWithFns(
  isoDateString: string | Date,
  options?: FormatDateOptions
): string {
  let date: Date;

  // ✅ Handle both string and Date inputs
  if (typeof isoDateString === 'string') {
    try {
      date = parseISO(isoDateString);
      if (isNaN(date.getTime())) throw new Error();
    } catch {
      throw new Error('Invalid ISO date string.');
    }
  } else if (isoDateString instanceof Date) {
    date = isoDateString;
  } else {
    throw new Error('Input must be a string or Date.');
  }

  const {
    showTime = false,
    separator = '-',
    monthFormat = 'short',
    yearFormat = 'short',
    order = ['DD', 'MMM', 'YYYY'],
  } = options || {};

  const formatMap: Record<DateFormatPart, string> = {
    DD: 'dd',
    MM: 'MM',
    MMM: monthFormat === 'short' ? 'MMM' : 'MMMM',
    YYYY: yearFormat === 'short' ? 'yy' : 'yyyy',
  };

  const dateFormatString = order.map(part => formatMap[part]).join(separator);
  let result = format(date, dateFormatString);

  if (showTime) {
    const timeFormat = 'h:mm a'; // 12-hour time with AM/PM
    result += ` ${format(date, timeFormat)}`;
  }

  return result;
}
