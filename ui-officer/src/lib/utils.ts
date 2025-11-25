import type { SensorState } from "../types/personnel";

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const formatTime = (value: string) =>
  new Intl.DateTimeFormat("ar-SA", {
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(value));

export const statusLabel: Record<SensorState, string> = {
  normal: "طبيعي",
  warning: "تنبيه",
  danger: "خطر",
  offline: "لا يوجد إشارة",
};

export const statusColor: Record<SensorState, string> = {
  normal: "bg-status-safe/15 text-status-safe",
  warning: "bg-status-warn/15 text-status-warn",
  danger: "bg-status-danger/15 text-status-danger",
  offline: "bg-gray-300 text-gray-600",
};

