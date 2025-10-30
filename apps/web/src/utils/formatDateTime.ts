import { format } from 'date-fns';

/**
 * Formats a date/time into DD/MM/YYYY HH:mm:ss for consistent table display.
 * Accepts Date, string, or number inputs.
 */
export function formatDateTimeExact(input: Date | string | number): string {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return '-';
  return format(d, 'dd/MM/yyyy HH:mm:ss');
}
