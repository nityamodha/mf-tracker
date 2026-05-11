import { Activity } from "lucide-react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { requireUser } from "@/services/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen md:grid-cols-[240px_1fr]">
        <aside className="hidden border-r border-sidebar-border bg-sidebar p-4 md:block">
          <div className="mb-8 flex items-center gap-3 px-3 pt-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">
              <Activity className="size-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">MF Ops Tracker</p>
              <p className="text-xs text-slate-300">Workflow Control</p>
            </div>
          </div>
          <SidebarNav isAdmin={profile.role === "admin"} />
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <MobileNav isAdmin={profile.role === "admin"} />
              <div>
                <p className="text-sm font-medium">Operational Command Center</p>
                <p className="text-xs text-muted-foreground">Live task visibility, servicing workflow, and SLA control</p>
              </div>
            </div>
            <UserMenu profile={profile} />
          </header>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
