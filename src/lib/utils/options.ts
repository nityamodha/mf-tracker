import type { TaskPriority, TaskStatus, UserRole } from "@/types/app";

export const ROLE_OPTIONS: UserRole[] = ["admin", "rm", "mid_office"];

export const TASK_PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high", "urgent"];

export const TASK_STATUS_OPTIONS: TaskStatus[] = [
  "new_request",
  "under_validation",
  "documents_pending",
  "awaiting_rm_response",
  "ready_for_processing",
  "submitted_to_amc",
  "in_progress",
  "completed",
  "rejected",
  "on_hold",
  "escalated",
  "closed",
];

export const KANBAN_COLUMNS: Array<{
  id: string;
  label: string;
  statuses: TaskStatus[];
}> = [
  { id: "new", label: "New", statuses: ["new_request", "under_validation"] },
  { id: "pending_docs", label: "Pending Docs", statuses: ["documents_pending"] },
  { id: "in_process", label: "In Process", statuses: ["ready_for_processing", "submitted_to_amc", "in_progress"] },
  { id: "awaiting_response", label: "Awaiting Response", statuses: ["awaiting_rm_response", "on_hold"] },
  { id: "completed", label: "Completed", statuses: ["completed", "closed"] },
  { id: "escalated", label: "Escalated", statuses: ["escalated", "rejected"] },
];
