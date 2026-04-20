import { format, isAfter, isBefore, parseISO } from 'date-fns';

export function formatDate(value?: string | null) {
  if (!value) return '-';
  return format(parseISO(value), 'dd MMM yyyy, HH:mm');
}

export function getLicenseStatus(expiryDate: string | null, isActive: boolean) {
  if (!isActive) return 'inactive';
  if (!expiryDate) return 'active';
  const now = new Date();
  const expiry = parseISO(expiryDate);
  if (isBefore(expiry, now)) return 'expired';
  if (isAfter(expiry, now)) return 'active';
  return 'inactive';
}
