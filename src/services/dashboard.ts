import { isToday, isPast } from "date-fns";

import { buildDistribution, getTasks } from "@/services/tasks";
import type { DashboardData, UserProfile } from "@/types/app";

export async function getDashboardData(profile: UserProfile) {
  const tasks = await getTasks(profile);

  const pendingTasks = tasks.filter((task) => !["completed", "closed", "rejected"].includes(task.status)).length;
  const overdueTasks = tasks.filter((task) => task.sla_due_at && isPast(new Date(task.sla_due_at)) && !task.completed_at).length;
  const completedToday = tasks.filter((task) => task.completed_at && isToday(new Date(task.completed_at))).length;
  const escalatedTasks = tasks.filter((task) => task.status === "escalated").length;

  return {
    cards: [
      { label: "Pending Tasks", value: pendingTasks, helper: "Open operational workload" },
      { label: "Overdue Tasks", value: overdueTasks, helper: "Past SLA and needs action" },
      { label: "Completed Today", value: completedToday, helper: "Closed within today’s cycle" },
      { label: "Escalated Tasks", value: escalatedTasks, helper: "Needs lead visibility" },
    ],
    statusChart: buildDistribution(tasks, "status"),
    rmChart: buildDistribution(tasks, "rm"),
    amcChart: buildDistribution(tasks, "amc"),
    recentTasks: tasks.slice(0, 8),
    overdueTasks: tasks.filter((task) => task.sla_due_at && isPast(new Date(task.sla_due_at)) && !task.completed_at).slice(0, 8),
  } satisfies DashboardData;
}
