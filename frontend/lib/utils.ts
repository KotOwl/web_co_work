import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "UAH"): string {
  const formatter = new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: currency,
  });
  return formatter.format(amount);
}

const CURRENCY_RATES: Record<string, number> = {
  UAH: 1.0,
  USD: 38.5,
  EUR: 41.5,
  PLN: 9.8,
};

export function convertAmount(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;
  const baseAmount = amount * (CURRENCY_RATES[fromCurrency] || 1.0);
  return baseAmount / (CURRENCY_RATES[toCurrency] || 1.0);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatError(err: any): string {
  const detail = err.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d.msg).join(", ");
  }
  return detail || err.message || "Сталася невідома помилка";
}
