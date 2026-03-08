import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function splitCsv(value: string | undefined, fallback: string[] = []) {
  if (!value) {
    return fallback;
  }

  const values = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return values.length ? values : fallback;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function buildStatusHref(pathname: string, status: string, kind = "ok") {
  const params = new URLSearchParams({ status, kind });
  return `${pathname}?${params.toString()}`;
}

export function firstOf<T>(value: T | T[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
