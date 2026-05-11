import { TaskCreateDialog } from "@/components/forms/task-create-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { TasksTable } from "@/components/tables/tasks-table";
import { getTaskLookups, getTasks } from "@/services/tasks";
import { requireUser } from "@/services/auth";

export default async function TasksPage() {
  const { profile } = await requireUser();
  const [tasks, lookups] = await Promise.all([getTasks(profile), getTaskLookups()]);

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Search, sort, bulk update, and manage every operational servicing ticket in one dense workflow table."
        actions={<TaskCreateDialog lookups={lookups} />}
      />
      <div className="p-6">
        <TasksTable tasks={tasks} />
      </div>
    </div>
  );
}
