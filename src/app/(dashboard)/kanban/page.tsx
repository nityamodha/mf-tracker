import { PageHeader } from "@/components/layout/page-header";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { getTasks } from "@/services/tasks";
import { requireUser } from "@/services/auth";

export default async function KanbanPage() {
  const { profile } = await requireUser();
  const tasks = await getTasks(profile);

  return (
    <div>
      <PageHeader title="Kanban" description="Drag tasks through operational stages with realtime refresh and instant SLA context." />
      <div className="p-6">
        <KanbanBoard tasks={tasks} />
      </div>
    </div>
  );
}
