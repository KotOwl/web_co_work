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
