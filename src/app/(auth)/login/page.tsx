import { LockKeyhole, ShieldCheck, TimerReset } from "lucide-react";

import { LoginForm } from "@/components/forms/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export default function LoginPage() {
  const configured = hasSupabaseEnv();

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
      <section className="ops-hero-bg hidden border-r border-slate-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="max-w-lg">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Mutual Fund Operations Workflow System</p>
          <h1 className="text-4xl font-semibold tracking-tight">Operational command center for servicing, SLA control, and execution accountability.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Built for relationship managers, mid-office teams, and ops leads handling KYC, SIP servicing, folio changes, AMC coordination, and transaction workflows.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: TimerReset, label: "SLA Clocking" },
            { icon: ShieldCheck, label: "Audit History" },
            { icon: LockKeyhole, label: "Role-Based Access" },
          ].map((item) => (
            <Card key={item.label} className="border-white/10 bg-white/5 text-white shadow-none backdrop-blur-sm">
              <CardContent className="space-y-3 p-4">
                <item.icon className="size-5" />
                <p className="text-sm font-medium">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          {!configured ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 text-sm text-amber-900">
                Supabase environment variables are not configured yet. Add values in `.env.local` before signing in.
              </CardContent>
            </Card>
          ) : null}
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
