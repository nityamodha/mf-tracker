import { z } from "zod";

import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/lib/utils/options";

export const createTaskSchema = z.object({
  client_id: z.string().uuid(),
  channel_partner_id: z.string().uuid().nullable().optional(),
  rm_id: z.string().uuid(),
  assigned_to: z.string().uuid(),
  task_type_id: z.string().uuid(),
  amc_id: z.string().uuid().nullable().optional(),
  priority: z.enum(TASK_PRIORITY_OPTIONS),
  due_date: z.string().min(1, "Due date is required."),
  description: z.string().trim().min(10, "Description must be at least 10 characters."),
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
