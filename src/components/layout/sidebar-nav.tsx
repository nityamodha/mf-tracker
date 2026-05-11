"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Briefcase, ClipboardList, KanbanSquare, Settings, ShieldCheck, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/kanban", label: "Kanban", icon: KanbanSquare },
  { href: "/reports", label: "Reports", icon: Briefcase },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navigation
        .filter((item) => isAdmin || item.href !== "/users")
        .map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      <div className="mt-6 rounded-lg border border-sidebar-border bg-white/5 p-3 text-xs text-slate-300">
        <div className="mb-1 flex items-center gap-2 font-medium text-white">
          <ShieldCheck className="size-3.5" />
          Workflow Guardrails
        </div>
        <p>SLA visibility, audit trails, and assignment accountability are always on.</p>
      </div>
    </nav>
  );
}
