import Link from "next/link";

import { PriorityBadge } from "@/components/tasks/priority-badge";
import { StatusBadge } from "@/components/tasks/status-badge";
import { SlaIndicator } from "@/components/tasks/sla-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatAging } from "@/lib/utils";
import type { TaskListItem } from "@/types/app";

export function TaskListCard({ title, tasks }: { title: string; tasks: TaskListItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead>Aging</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length ? (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-mono text-xs font-semibold">
                    <Link href={`/tasks/${task.id}`} className="hover:underline">
                      {task.ticket_number}
                    </Link>
                  </TableCell>
                  <TableCell>{task.client?.client_name ?? "—"}</TableCell>
                  <TableCell><StatusBadge status={task.status} /></TableCell>
                  <TableCell><PriorityBadge priority={task.priority} /></TableCell>
                  <TableCell><SlaIndicator slaDueAt={task.sla_due_at} completedAt={task.completed_at} /></TableCell>
                  <TableCell>{formatAging(task.created_at, task.completed_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No tasks available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
