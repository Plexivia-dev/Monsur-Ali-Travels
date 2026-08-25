import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Format BDT currency */
export function formatBDT(amount) {
  if (amount >= 1_000_000) return `৳${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `৳${(amount / 1_000).toFixed(0)}k`;
  return `৳${amount.toLocaleString()}`;
}

/** Relative time string */
export function timeAgo(isoDate) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60_000));
  if (mins === 0) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(isoDate).toLocaleDateString('en-GB');
}

/** Truncate string */
export function truncate(str, max = 50) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/** Format DD/MM/YYYY */
export function formatToDdMmYyyy(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB'); // This gives DD/MM/YYYY format out of the box
}
