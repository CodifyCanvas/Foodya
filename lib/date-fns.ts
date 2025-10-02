import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

type DateFormatPart = 'DD' | 'MM' | 'MMM' | 'YYYY';

interface FormatDateOptions {
  showTime?: boolean;
  showSeconds?: boolean;
  separator?: '-' | '/' | '.' | ',';
  monthFormat?: 'short' | 'long';
  yearFormat?: 'short' | 'long';
  order?: DateFormatPart[];
  timeZone?: string; // NEW: optional timezone, default to UTC
}

/**
 * Formats a given ISO date string or Date object into a custom format using a specific timezone.
 */
export function formatDateWithFns(
  isoDateString: string | Date,
  options?: FormatDateOptions
): string {
  let date: Date;

  if (typeof isoDateString === 'string') {
    date = parseISO(isoDateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid ISO date string.');
    }
  } else if (isoDateString instanceof Date) {
    date = isoDateString;
  } else {
    throw new Error('Input must be a string or Date.');
  }

  const {
    showTime = false,
    showSeconds = false,
    separator = '-',
    monthFormat = 'short',
    yearFormat = 'short',
    order = ['DD', 'MMM', 'YYYY'],
    timeZone = 'UTC',
  } = options || {};

  const formatMap: Record<DateFormatPart, string> = {
    DD: 'dd',
    MM: 'MM',
    MMM: monthFormat === 'short' ? 'MMM' : 'MMMM',
    YYYY: yearFormat === 'short' ? 'yy' : 'yyyy',
  };

  const dateFormatString = order.map(part => formatMap[part]).join(separator);
  let result = formatInTimeZone(date, timeZone, dateFormatString);

  if (showTime) {
    const timeFormat = showSeconds ? 'h:mm:ss a' : 'h:mm a'; // 12-hour with AM/PM
    result += ` ${formatInTimeZone(date, timeZone, timeFormat)}`;
  }

  return result;
}
