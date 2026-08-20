import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format BDT currency */
export function formatBDT(amount: number): string {
  if (amount >= 1_000_000) return `৳${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `৳${(amount / 1_000).toFixed(0)}k`;
  return `৳${amount.toLocaleString()}`;
}

/** Relative time string */
export function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60_000));
  if (mins === 0) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(isoDate).toLocaleDateString('en-GB');
}

/** Truncate string */
export function truncate(str: string, max = 50): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}
