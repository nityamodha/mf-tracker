import { z } from "zod";

import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/lib/utils/options";

export const createTaskSchema = z.object({
  client_name: z.string().trim(),
  channel_partner_name: z.string().trim(),
  rm_name: z.string().trim(),
  assigned_to_name: z.string().trim(),
  task_type_name: z.string().trim(),
  amc_name: z.string().trim(),
  priority: z.enum(TASK_PRIORITY_OPTIONS),
  due_date: z.string(),
  description: z.string().trim(),
});

export const taskStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(TASK_STATUS_OPTIONS),
});

export const taskAssignmentSchema = z.object({
  taskId: z.string().uuid(),
  assigned_to: z.string().uuid(),
});

export const taskPrioritySchema = z.object({
  taskId: z.string().uuid(),
  priority: z.enum(TASK_PRIORITY_OPTIONS),
});

export const taskCommentSchema = z.object({
  taskId: z.string().uuid(),
  comment: z.string().trim().min(1, "Comment is required.").max(2000),
});

export const taskBulkUpdateSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1, "Select at least one task."),
  status: z.enum(TASK_STATUS_OPTIONS),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
