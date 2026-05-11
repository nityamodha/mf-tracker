import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/app";
import type { Database } from "@/types/database";

const SESSION_COOKIE = "mf_ops_session";

type UserRecord = Database["public"]["Tables"]["users"]["Row"];

export async function getSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  return { user: { id: userId } };
}

export async function getCurrentUserProfile() {
  const session = await getSession();
  if (!session) return null;

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("users")
    .select("id, full_name, email, role, team, is_active, created_at")
    .eq("id", session.user.id)
    .single();

  return (data as UserProfile | null) ?? null;
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await getCurrentUserProfile();
  if (!profile || !profile.is_active) {
    redirect("/login");
  }

  return {
    session,
    profile,
  };
}

export async function requireAdmin() {
  const { profile } = await requireUser();
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}

export async function getUserByEmail(email: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("users").select("*").ilike("email", email).single();
  return (data as UserRecord | null) ?? null;
}

export async function createAppSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAppSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
