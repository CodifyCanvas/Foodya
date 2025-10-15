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
  timeZone?: string;
}



/**
 * === Formats a date into a custom string based on format options and timezone. ===
 *
 * @param {string | Date} isoDate - An ISO date string or Date object.
 * @param {FormatDateOptions} [options] - Optional settings to customize output.
 * @param {boolean} [options.showTime=false] - Whether to include time in the output.
 * @param {boolean} [options.showSeconds=false] - Whether to include seconds in time.
 * @param {'-' | '/' | '.' | ','} [options.separator='-'] - Separator between date parts.
 * @param {'short' | 'long'} [options.monthFormat='short'] - Display short or long month.
 * @param {'short' | 'long'} [options.yearFormat='short'] - Display 2-digit or 4-digit year.
 * @param {DateFormatPart[]} [options.order=['DD', 'MMM', 'YYYY']] - Order of date components.
 * @param {string} [options.timeZone='Asia/Karachi'] - Timezone to format the date in.
 *
 * @returns {string} - The formatted date (and optional time) string.
 *
 * @throws {Error} - If input is not a valid date string or Date object.
 */
export function formatDateWithFns(isoDate: string | Date, options: FormatDateOptions = {}): string {
  
  const {
    showTime = false,
    showSeconds = false,
    separator = '-',
    monthFormat = 'short',
    yearFormat = 'short',
    order = ['DD', 'MMM', 'YYYY'],
    timeZone = 'Asia/Karachi',
  } = options;

  // === Parse and validate input date ===
  const date = typeof isoDate === 'string'
    ? parseISO(isoDate)
    : isoDate instanceof Date
      ? isoDate
      : null;

  if (!date || isNaN(date.getTime())) {
    throw new Error('Invalid date input. Must be a valid ISO string or Date object.');
  }

  // === Mapping date format parts to date-fns tokens ===
  const tokenMap: Record<DateFormatPart, string> = {
    DD: 'dd',
    MM: 'MM',
    MMM: monthFormat === 'short' ? 'MMM' : 'MMMM',
    YYYY: yearFormat === 'short' ? 'yy' : 'yyyy',
  };

  const dateFormat = order.map(part => tokenMap[part]).join(separator);
  let formatted = formatInTimeZone(date, timeZone, dateFormat);

  // === Append time if required ===
  if (showTime) {
    const timeFormat = showSeconds ? 'h:mm:ss a' : 'h:mm a';
    const timeString = formatInTimeZone(date, timeZone, timeFormat);
    formatted += ` ${timeString}`;
  }

  return formatted;
}