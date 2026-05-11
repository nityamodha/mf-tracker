import { clsx, type ClassValue } from "clsx";
import { differenceInHours, differenceInMinutes, format, formatDistanceToNowStrict, isAfter, subHours } from "date-fns";
import { twMerge } from "tailwind-merge";

import type { TaskPriority, TaskStatus } from "@/types/app";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";
  return format(new Date(value), "dd MMM yyyy, hh:mm a");
}

export function formatDateShort(value?: string | Date | null) {
  if (!value) return "—";
  return format(new Date(value), "dd MMM yyyy");
}

export function getStatusLabel(status: TaskStatus) {
  return {
    new_request: "New Request",
    under_validation: "Under Validation",
    documents_pending: "Documents Pending",
    awaiting_rm_response: "Awaiting RM Response",
    ready_for_processing: "Ready for Processing",
    submitted_to_amc: "Submitted to AMC",
    in_progress: "In Progress",
    completed: "Completed",
    rejected: "Rejected",
    on_hold: "On Hold",
    escalated: "Escalated",
    closed: "Closed",
  }[status];
}

export function getPriorityLabel(priority: TaskPriority) {
  return priority.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getPriorityTone(priority: TaskPriority) {
  return {
    low: "bg-slate-100 text-slate-700 border-slate-200",
    medium: "bg-sky-50 text-sky-700 border-sky-200",
    high: "bg-amber-50 text-amber-700 border-amber-200",
    urgent: "bg-rose-50 text-rose-700 border-rose-200",
  }[priority];
}

export function getStatusTone(status: TaskStatus) {
  return {
    new_request: "bg-slate-100 text-slate-700 border-slate-200",
    under_validation: "bg-indigo-50 text-indigo-700 border-indigo-200",
    documents_pending: "bg-amber-50 text-amber-700 border-amber-200",
    awaiting_rm_response: "bg-orange-50 text-orange-700 border-orange-200",
    ready_for_processing: "bg-sky-50 text-sky-700 border-sky-200",
    submitted_to_amc: "bg-cyan-50 text-cyan-700 border-cyan-200",
    in_progress: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    on_hold: "bg-stone-100 text-stone-700 border-stone-200",
    escalated: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    closed: "bg-slate-200 text-slate-700 border-slate-300",
  }[status];
}

export type SlaState = "healthy" | "warning" | "breached" | "complete";

export function getSlaState(slaDueAt?: string | null, completedAt?: string | null): SlaState {
  if (completedAt) return "complete";
  if (!slaDueAt) return "healthy";

  const due = new Date(slaDueAt);
  const now = new Date();

  if (isAfter(now, due)) return "breached";
  if (isAfter(now, subHours(due, 4))) return "warning";
  return "healthy";
}

export function getSlaTone(state: SlaState) {
  return {
    healthy: "text-emerald-700 bg-emerald-50 border-emerald-200",
    warning: "text-amber-700 bg-amber-50 border-amber-200",
    breached: "text-rose-700 bg-rose-50 border-rose-200",
    complete: "text-slate-700 bg-slate-100 border-slate-200",
  }[state];
}

export function formatAging(createdAt?: string | null, completedAt?: string | null) {
  if (!createdAt) return "—";
  const end = completedAt ? new Date(completedAt) : new Date();
  const start = new Date(createdAt);
  const hours = differenceInHours(end, start);
  if (hours < 24) return `${Math.max(hours, 0)}h`;
  return formatDistanceToNowStrict(start, { addSuffix: false });
}

export function formatTimeToSla(slaDueAt?: string | null) {
  if (!slaDueAt) return "No SLA";
  const minutes = differenceInMinutes(new Date(slaDueAt), new Date());
  if (minutes < 0) return `${Math.abs(minutes)}m over`;
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h left`;
}

export function initials(name?: string | null) {
  if (!name) return "NA";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
