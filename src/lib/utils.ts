import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Currency } from "@/contexts/currency-context";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: Currency = 'USD', compact = false) {
  let locale = 'es-US';
  if (currency === 'DOP') locale = 'es-DO';
  if (currency === 'EUR') locale = 'es-ES';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    notation: compact ? 'compact' : 'standard',
  }).format(amount);
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  // Add time zone offset to prevent date from changing
  const dateWithOffset = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateWithOffset);
}

export function getRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time part for accurate date comparison
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return 'Hoy';
  }
  if (date.getTime() === yesterday.getTime()) {
    return 'Ayer';
  }
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}
