"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createTaskSchema, taskAssignmentSchema, taskBulkUpdateSchema, taskCommentSchema, taskPrioritySchema, taskStatusSchema } from "@/lib/validators/task";
import { createUserSchema, toggleUserSchema } from "@/lib/validators/user";
import { loginSchema } from "@/lib/validators/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSlaDueAt } from "@/services/tasks";
import { clearAppSession, createAppSession, getUserByEmail, requireAdmin, requireUser } from "@/services/auth";
import type { Database } from "@/types/database";

type ActionResult = {
  success: boolean;
  error?: string;
};

function ok(): ActionResult {
  return { success: true };
}

function fail(error: unknown): ActionResult {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Something went wrong.",
  };
}

export async function loginAction(input: unknown): Promise<ActionResult> {
  try {
    const values = loginSchema.parse(input);
    const user = await getUserByEmail(values.email);
    if (!user || !user.is_active || user.password !== values.password) {
      throw new Error("Invalid email or password.");
    }

    await createAppSession(user.id);
    return ok();
  } catch (error) {
    return fail(error);
  }
}

export async function logoutAction() {
  await clearAppSession();
  redirect("/login");
}

export async function createTaskAction(input: unknown): Promise<ActionResult> {
  try {
    const { profile } = await requireUser();
    const values = createTaskSchema.parse(input);
    const supabase = createSupabaseAdminClient();

    const { data: taskType, error: taskTypeError } = await supabase.from("task_types").select("*").eq("id", values.task_type_id).single();
    if (taskTypeError || !taskType) throw new Error("Unable to resolve task type SLA.");

    const payload: Database["public"]["Tables"]["tasks"]["Insert"] = {
      ...values,
      channel_partner_id: values.channel_partner_id || null,
      amc_id: values.amc_id || null,
      created_by: profile.id,
      status: "new_request" as const,
      sla_due_at: getSlaDueAt(taskType.default_sla_hours, values.due_date),
    };

    const { error } = await supabase.from("tasks").insert(payload);
    if (error) throw error;

    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath("/kanban");
    return ok();
  } catch (error) {
    return fail(error);
  }
}

export async function updateTaskStatusAction(input: unknown): Promise<ActionResult> {
  try {
    await requireUser();
    const values = taskStatusSchema.parse(input);
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("tasks")
      .update({
        status: values.status,
        completed_at: values.status === "completed" || values.status === "closed" ? new Date().toISOString() : null,
      } satisfies Database["public"]["Tables"]["tasks"]["Update"])
      .eq("id", values.taskId);
    if (error) throw error;

    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${values.taskId}`);
    revalidatePath("/kanban");
    return ok();
  } catch (error) {
    return fail(error);
  }
}

export async function updateTaskAssignmentAction(input: unknown): Promise<ActionResult> {
  try {
    await requireUser();
    const values = taskAssignmentSchema.parse(input);
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("tasks")
      .update({ assigned_to: values.assigned_to } satisfies Database["public"]["Tables"]["tasks"]["Update"])
      .eq("id", values.taskId);
    if (error) throw error;

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${values.taskId}`);
    revalidatePath("/kanban");
    return ok();
  } catch (error) {
    return fail(error);
  }
}

export async function updateTaskPriorityAction(input: unknown): Promise<ActionResult> {
  try {
    await requireUser();
    const values = taskPrioritySchema.parse(input);
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("tasks")
      .update({ priority: values.priority } satisfies Database["public"]["Tables"]["tasks"]["Update"])
      .eq("id", values.taskId);
    if (error) throw error;

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${values.taskId}`);
    revalidatePath("/kanban");
    return ok();
  } catch (error) {
    return fail(error);
  }
}

export async function bulkUpdateTaskStatusAction(input: unknown): Promise<ActionResult> {
  try {
    await requireUser();
    const values = taskBulkUpdateSchema.parse(input);
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("tasks")
      .update({ status: values.status } satisfies Database["public"]["Tables"]["tasks"]["Update"])
      .in("id", values.taskIds);
    if (error) throw error;

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath("/kanban");
    return ok();
  } catch (error) {
    return fail(error);
  }
}

export async function addTaskCommentAction(input: unknown): Promise<ActionResult> {
  try {
    const { profile } = await requireUser();
    const values = taskCommentSchema.parse(input);
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("task_comments").insert({
      task_id: values.taskId,
      user_id: profile.id,
      comment: values.comment,
    } satisfies Database["public"]["Tables"]["task_comments"]["Insert"]);
    if (error) throw error;

    revalidatePath(`/tasks/${values.taskId}`);
    return ok();
  } catch (error) {
    return fail(error);
  }
}

export async function uploadTaskAttachmentAction(formData: FormData): Promise<ActionResult> {
  try {
    const { profile } = await requireUser();
    const taskId = String(formData.get("taskId") ?? "");
    const file = formData.get("file");
    if (!taskId) throw new Error("Task ID is required.");
    if (!(file instanceof File) || file.size === 0) throw new Error("Choose a file to upload.");

    const supabase = createSupabaseAdminClient();
    const path = `${taskId}/${Date.now()}-${file.name.replace(/\s+/g, "-").toLowerCase()}`;

    const { error: uploadError } = await supabase.storage.from("task-attachments").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });
    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase.from("task_attachments").insert({
      task_id: taskId,
      file_name: file.name,
      file_url: path,
      uploaded_by: profile.id,
    } satisfies Database["public"]["Tables"]["task_attachments"]["Insert"]);
    if (insertError) throw insertError;

    revalidatePath(`/tasks/${taskId}`);
    return ok();
  } catch (error) {
    return fail(error);
  }
}

export async function createUserAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const values = createUserSchema.parse(input);
    const supabase = createSupabaseAdminClient();

    const { error: profileError } = await supabase.from("users").insert({
      id: crypto.randomUUID(),
      full_name: values.full_name,
      email: values.email.toLowerCase(),
      password: values.password,
      role: values.role,
      team: values.team || null,
      is_active: true,
    } satisfies Database["public"]["Tables"]["users"]["Insert"]);
    if (profileError) throw profileError;

    revalidatePath("/users");
    return ok();
  } catch (error) {
    return fail(error);
  }
}

export async function toggleUserActiveAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const values = toggleUserSchema.parse(input);
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("users")
      .update({ is_active: values.isActive } satisfies Database["public"]["Tables"]["users"]["Update"])
      .eq("id", values.userId);
    if (error) throw error;

    revalidatePath("/users");
    return ok();
  } catch (error) {
    return fail(error);
  }
}
