"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { DndContext, PointerSensor, closestCorners, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";

import { updateTaskStatusAction } from "@/app/actions";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { SlaIndicator } from "@/components/tasks/sla-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskRealtime } from "@/hooks/use-task-realtime";
import { KANBAN_COLUMNS } from "@/lib/utils/options";
import { formatAging } from "@/lib/utils";
import type { TaskListItem } from "@/types/app";

function SortableTaskCard({ task }: { task: TaskListItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  return (
    <Link
      href={`/tasks/${task.id}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className="block rounded-lg border bg-white p-3 shadow-xs"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold">{task.ticket_number}</span>
        <PriorityBadge priority={task.priority} />
      </div>
      <p className="text-sm font-medium">{task.client?.client_name ?? "Unknown client"}</p>
      <p className="mt-1 text-xs text-muted-foreground">{task.task_type?.name ?? "Task type pending"}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <SlaIndicator slaDueAt={task.sla_due_at} completedAt={task.completed_at} />
        <span className="text-xs text-muted-foreground">{formatAging(task.created_at, task.completed_at)}</span>
      </div>
    </Link>
  );
}

export function KanbanBoard({ tasks }: { tasks: TaskListItem[] }) {
  useTaskRealtime();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [pending, startTransition] = useTransition();
  const [localTasks, setLocalTasks] = useState(tasks);

  const grouped = useMemo(() => {
    return KANBAN_COLUMNS.map((column) => ({
      ...column,
      tasks: localTasks.filter((task) => column.statuses.includes(task.status)),
    }));
  }, [localTasks]);

  const findColumn = (taskId: string) => grouped.find((column) => column.tasks.some((task) => task.id === taskId));

  const onDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    if (!overId) return;

    const source = findColumn(activeId);
    const destination = grouped.find((column) => column.id === overId) ?? findColumn(overId);

    if (!source || !destination) return;
    if (source.id === destination.id) {
      const sourceTasks = source.tasks;
      const oldIndex = sourceTasks.findIndex((task) => task.id === activeId);
      const newIndex = sourceTasks.findIndex((task) => task.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(sourceTasks, oldIndex, newIndex);
      setLocalTasks((current) => current.map((task) => reordered.find((item) => item.id === task.id) ?? task));
      return;
    }

    setLocalTasks((current) =>
      current.map((task) =>
        task.id === activeId
          ? {
              ...task,
              status: destination.statuses[0],
            }
          : task,
      ),
    );

    startTransition(async () => {
      const result = await updateTaskStatusAction({
        taskId: activeId,
        status: destination.statuses[0],
      });
      if (!result.success) {
        toast.error(result.error ?? "Unable to move task.");
      } else {
        toast.success("Task lane updated.");
      }
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="grid gap-4 xl:grid-cols-6">
        {grouped.map((column) => (
          <Card key={column.id} className="min-h-[540px]">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{column.label}</span>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{column.tasks.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-3">
              <SortableContext id={column.id} items={column.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                {column.tasks.map((task) => (
                  <SortableTaskCard key={task.id} task={task} />
                ))}
              </SortableContext>
              {!column.tasks.length ? <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">{pending ? "Updating..." : "No tasks in this lane"}</div> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </DndContext>
  );
}
