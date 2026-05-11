import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { requireUser } from "@/services/auth";

export default async function SettingsPage() {
  const { profile } = await requireUser();

  return (
    <div>
      <PageHeader title="Settings" description="Current access context, environment readiness, and platform notes for deployment and support." />
      <div className="grid gap-6 p-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {profile.full_name}</p>
            <p><span className="text-muted-foreground">Email:</span> {profile.email}</p>
            <p><span className="text-muted-foreground">Role:</span> {profile.role}</p>
            <p><span className="text-muted-foreground">Team:</span> {profile.team ?? "—"}</p>
            <p><span className="text-muted-foreground">Active:</span> {profile.is_active ? "Yes" : "No"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deployment Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="text-muted-foreground">Supabase Variables:</span> {hasSupabaseEnv() ? "Configured" : "Missing"}</p>
            <p><span className="text-muted-foreground">Auth Mode:</span> Email/password only</p>
            <p><span className="text-muted-foreground">Storage:</span> Supabase bucket `task-attachments`</p>
            <p><span className="text-muted-foreground">Realtime:</span> Tasks and comments subscriptions enabled</p>
            <p><span className="text-muted-foreground">Hosting:</span> Vercel with App Router runtime</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
