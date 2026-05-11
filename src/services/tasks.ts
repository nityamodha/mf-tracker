import { addHours } from "date-fns";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { DashboardDataset, TaskActivity, TaskAttachment, TaskComment, TaskDetail, TaskListItem, TaskLookupData, UserProfile } from "@/types/app";

function baseTaskSelect() {
  return `
    *,
    client:clients(*),
    channel_partner:channel_partners(*),
    rm:users!tasks_rm_id_fkey(id, full_name, email, role),
    assignee:users!tasks_assigned_to_fkey(id, full_name, email, role),
    task_type:task_types(*),
    amc:amcs(*),
    creator:users!tasks_created_by_fkey(id, full_name, email, role)
  `;
}

function applyTaskAccessFilter(query: any, profile: UserProfile) {
  if (profile.role === "admin") return query;
  if (profile.role === "rm") {
    return query.or(`rm_id.eq.${profile.id},created_by.eq.${profile.id}`);
  }
  return query.eq("assigned_to", profile.id);
}

export async function getTasks(profile: UserProfile) {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("tasks").select(baseTaskSelect()).order("updated_at", { ascending: false });
  query = applyTaskAccessFilter(query, profile);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as TaskListItem[];
}

export async function getTaskLookups() {
  const supabase = createSupabaseAdminClient();
  const [{ data: clients }, { data: channelPartners }, { data: users }, { data: amcs }, { data: taskTypes }] = await Promise.all([
    supabase.from("clients").select("*").order("client_name"),
    supabase.from("channel_partners").select("*").order("partner_name"),
    supabase.from("users").select("id, full_name, email, role, team, is_active, created_at").eq("is_active", true).order("full_name"),
    supabase.from("amcs").select("*").order("name"),
    supabase.from("task_types").select("*").order("name"),
  ]);

  return {
    clients: clients ?? [],
    channelPartners: channelPartners ?? [],
    users: users ?? [],
    amcs: amcs ?? [],
    taskTypes: taskTypes ?? [],
  } satisfies TaskLookupData;
}

export async function getTaskById(taskId: string, profile: UserProfile) {
  const supabase = createSupabaseAdminClient();

  let taskQuery = supabase.from("tasks").select(baseTaskSelect()).eq("id", taskId).single();
  taskQuery = applyTaskAccessFilter(taskQuery, profile);

  const [{ data: task, error: taskError }, { data: comments }, { data: attachments }, { data: activity }] = await Promise.all([
    taskQuery,
    supabase
      .from("task_comments")
      .select("*, user:users(id, full_name, email)")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false }),
    supabase
      .from("task_attachments")
      .select("*, uploader:users(id, full_name)")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false }),
    supabase
      .from("task_activity_logs")
      .select("*, actor:users(id, full_name)")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false }),
  ]);

  if (taskError) throw taskError;
  if (!task) return null;

  const signedAttachments = await Promise.all(
    ((attachments as TaskAttachment[] | null) ?? []).map(async (attachment) => {
      const { data } = await supabase.storage.from("task-attachments").createSignedUrl(attachment.file_url, 60 * 60);
      return { ...attachment, signed_url: data?.signedUrl ?? null };
    }),
  );

  return {
    ...(task as unknown as TaskListItem),
    comments: (comments as TaskComment[] | null) ?? [],
    attachments: signedAttachments,
    activity: (activity as TaskActivity[] | null) ?? [],
  } as TaskDetail;
}

export function getSlaDueAt(defaultSlaHours: number, dueDate: string) {
  const dueBase = new Date(dueDate);
  return addHours(dueBase, defaultSlaHours).toISOString();
}

export function buildDistribution(items: TaskListItem[], type: "status" | "rm" | "amc"): DashboardDataset[] {
  const map = new Map<string, number>();

  for (const item of items) {
    const key =
      type === "status" ? item.status : type === "rm" ? item.rm?.full_name ?? "Unassigned RM" : item.amc?.name ?? "Unmapped AMC";
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return [...map.entries()].map(([name, value]) => ({ name, value }));
}
