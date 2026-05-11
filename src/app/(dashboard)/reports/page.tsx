import { formatDistanceToNowStrict, isPast } from "date-fns";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTasks } from "@/services/tasks";
import { requireUser } from "@/services/auth";

export default async function ReportsPage() {
  const { profile } = await requireUser();
  const tasks = await getTasks(profile);

  const assigneeSummary = Object.values(
    tasks.reduce<Record<string, { name: string; open: number; overdue: number }>>((acc, task) => {
      const key = task.assignee?.id ?? "unassigned";
      if (!acc[key]) {
        acc[key] = { name: task.assignee?.full_name ?? "Unassigned", open: 0, overdue: 0 };
      }
      if (!["completed", "closed", "rejected"].includes(task.status)) acc[key].open += 1;
      if (task.sla_due_at && isPast(new Date(task.sla_due_at)) && !task.completed_at) acc[key].overdue += 1;
      return acc;
    }, {}),
  );

  const oldestOpen = tasks
    .filter((task) => !task.completed_at)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 10);

  return (
    <div>
      <PageHeader title="Reports" description="Operational reporting for workload concentration, SLA slippage, and oldest unresolved requests." />
      <div className="grid gap-6 p-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Assignee Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Open</TableHead>
                  <TableHead>Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assigneeSummary.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.open}</TableCell>
                    <TableCell>{item.overdue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oldest Open Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Open Since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oldestOpen.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-mono text-xs">{task.ticket_number}</TableCell>
                    <TableCell>{task.client?.client_name ?? "—"}</TableCell>
                    <TableCell>{task.status}</TableCell>
                    <TableCell>{formatDistanceToNowStrict(new Date(task.created_at), { addSuffix: true })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
