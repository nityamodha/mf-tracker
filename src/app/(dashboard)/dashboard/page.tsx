import { DistributionChart } from "@/components/dashboard/distribution-chart";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { TaskListCard } from "@/components/dashboard/task-list-card";
import { PageHeader } from "@/components/layout/page-header";
import { getDashboardData } from "@/services/dashboard";
import { requireUser } from "@/services/auth";

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const data = await getDashboardData(profile);

  return (
    <div>
      <PageHeader title="Dashboard" description="Monitor operational backlog, SLA exposure, and task flow across RMs and processing teams." />
      <div className="space-y-6 p-6">
        <MetricsGrid cards={data.cards} />
        <div className="grid gap-6 xl:grid-cols-3">
          <DistributionChart title="Tasks by Status" type="pie" data={data.statusChart} />
          <DistributionChart title="Tasks by RM" data={data.rmChart} />
          <DistributionChart title="Tasks by AMC" data={data.amcChart} />
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <TaskListCard title="Recent Tasks" tasks={data.recentTasks} />
          <TaskListCard title="Overdue Tasks" tasks={data.overdueTasks} />
        </div>
      </div>
    </div>
  );
}
