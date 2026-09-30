import { format } from 'date-fns';

export function getGreeting(date: Date = new Date()): string {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) return 'Good morning';
  if (hours >= 12 && hours < 17) return 'Good afternoon';
  if (hours >= 17 && hours < 22) return 'Good evening';
  return 'Good night';
}

export function formatHeaderDate(date: Date = new Date()): string {
  return format(date, 'EEEE, d MMMM');
}

export function formatMobileDate(date: Date = new Date()): string {
  return format(date, 'EEE, d MMM yyyy');
}
