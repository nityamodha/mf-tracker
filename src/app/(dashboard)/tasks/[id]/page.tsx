import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { TaskDetailWorkspace } from "@/components/tasks/task-detail-workspace";
import { getTaskById, getTaskLookups } from "@/services/tasks";
import { requireUser } from "@/services/auth";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { profile } = await requireUser();
  const { id } = await params;
  const [task, lookups] = await Promise.all([getTaskById(id, profile), getTaskLookups()]);

  if (!task) notFound();

  return (
    <div>
      <PageHeader
        title={task.ticket_number}
        description="Full task command view with client context, workflow controls, comments, attachments, and audit trail."
      />
      <TaskDetailWorkspace task={task} users={lookups.users} />
    </div>
  );
}
