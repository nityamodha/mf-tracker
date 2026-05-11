import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getCurrentUserProfile, getSession } from "@/services/auth";

export default async function HomePage() {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await getCurrentUserProfile();
  if (!profile?.is_active) redirect("/login");

  redirect("/dashboard");
}
