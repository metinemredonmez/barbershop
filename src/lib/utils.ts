import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function parseExtraServiceIds(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((x) => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export type AppointmentLike = {
  service: { id: string; name: string; durationMin: number; price: number };
  extraServices: string | null;
};

export function getAppointmentServices<
  T extends { id: string; name: string; durationMin: number; price: number },
>(
  appt: AppointmentLike,
  servicesById: Map<string, T>
): T[] {
  const list: T[] = [];
  const primary = servicesById.get(appt.service.id);
  if (primary) list.push(primary);
  for (const id of parseExtraServiceIds(appt.extraServices)) {
    const s = servicesById.get(id);
    if (s) list.push(s);
  }
  return list;
}

export function getAppointmentTotals<
  T extends { id: string; name: string; durationMin: number; price: number },
>(appt: AppointmentLike, servicesById: Map<string, T>) {
  const list = getAppointmentServices(appt, servicesById);
  return {
    services: list,
    total: list.reduce((sum, s) => sum + s.price, 0),
    duration: list.reduce((sum, s) => sum + s.durationMin, 0),
  };
}
