import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | string, fractionDigits = 2) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(Number(value));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    RUNNING: "Çalışıyor",
    STOPPED: "Durdu",
    MAINTENANCE: "Bakımda",
    FAULT: "Arızalı"
  };

  return labels[status] ?? status;
}

export function roleLabel(role: string) {
  const labels: Record<string, string> = {
    ADMIN: "Yönetici",
    FACTORY_MANAGER: "Fabrika Müdürü",
    SHIFT_SUPERVISOR: "Vardiya Şefi",
    OPERATOR: "Operatör"
  };

  return labels[role] ?? role;
}

export function defaultRouteByRole(role?: string) {
  if (role === "OPERATOR") {
    return "/makineler";
  }
  return "/dashboard";
}

