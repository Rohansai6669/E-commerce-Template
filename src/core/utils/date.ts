import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(date: Date | string, pattern = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern);
}

export function formatDistance(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}
