import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/app";

export async function getUsers(): Promise<UserProfile[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email, role, team, is_active, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as UserProfile[];
}
