/* eslint-disable react-hooks/incompatible-library */
"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { bulkUpdateTaskStatusAction } from "@/app/actions";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { SlaIndicator } from "@/components/tasks/sla-indicator";
import { StatusBadge } from "@/components/tasks/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTaskRealtime } from "@/hooks/use-task-realtime";
import { formatAging, formatDateTime } from "@/lib/utils";
import type { TaskListItem } from "@/types/app";

export function TasksTable({ tasks }: { tasks: TaskListItem[] }) {
  useTaskRealtime();

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "updated_at", desc: true }]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [bulkStatus, setBulkStatus] = useState("in_progress");
  const [pending, startTransition] = useTransition();

  const columns = useMemo<ColumnDef<TaskListItem>[]>(
    () => [
      {
        id: "select",
        header: () => <input type="checkbox" aria-label="Select all" />,
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Select ${row.original.ticket_number}`}
          />
        ),
      },
      {
        accessorKey: "ticket_number",
        header: "Ticket ID",
        cell: ({ row }) => (
          <Link href={`/tasks/${row.original.id}`} className="font-mono text-xs font-semibold hover:underline">
            {row.original.ticket_number}
          </Link>
        ),
      },
      { accessorFn: (row) => row.client?.client_name ?? "—", id: "client", header: "Client Name" },
      { accessorFn: (row) => row.channel_partner?.partner_name ?? "—", id: "channel_partner", header: "Channel Partner" },
      { accessorFn: (row) => row.rm?.full_name ?? "—", id: "rm", header: "RM" },
      { accessorFn: (row) => row.task_type?.name ?? "—", id: "task_type", header: "Task Type" },
      { accessorFn: (row) => row.amc?.name ?? "—", id: "amc", header: "AMC" },
      { accessorKey: "priority", header: "Priority", cell: ({ row }) => <PriorityBadge priority={row.original.priority} /> },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorFn: (row) => row.assignee?.full_name ?? "—", id: "assignee", header: "Assigned To" },
      { accessorKey: "sla_due_at", header: "SLA Due", cell: ({ row }) => <SlaIndicator slaDueAt={row.original.sla_due_at} completedAt={row.original.completed_at} /> },
      { id: "aging", header: "Aging", cell: ({ row }) => formatAging(row.original.created_at, row.original.completed_at) },
      { accessorKey: "updated_at", header: "Last Updated", cell: ({ row }) => formatDateTime(row.original.updated_at) },
    ],
    [],
  );

  const table = useReactTable({
    data: tasks,
    columns,
    state: {
      globalFilter,
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const haystack = [
        row.original.ticket_number,
        row.original.client?.client_name,
        row.original.channel_partner?.partner_name,
        row.original.rm?.full_name,
        row.original.task_type?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(String(filterValue).toLowerCase());
    },
  });

  const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id);

  const handleBulkUpdate = () => {
    startTransition(async () => {
      const result = await bulkUpdateTaskStatusAction({ taskIds: selectedIds, status: bulkStatus });
      if (!result.success) {
        toast.error(result.error ?? "Bulk update failed.");
        return;
      }

      toast.success("Selected tasks updated.");
      setRowSelection({});
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} className="pl-9" placeholder="Search ticket, client, RM, task type" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Bulk status" />
              </SelectTrigger>
              <SelectContent>
                {["new_request", "documents_pending", "in_progress", "awaiting_rm_response", "completed", "escalated"].map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" disabled={!selectedIds.length || pending} onClick={handleBulkUpdate}>
              Bulk Status Update
            </Button>
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <button
                          className="inline-flex items-center gap-1"
                          onClick={header.column.getToggleSortingHandler()}
                          type="button"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() ? <ArrowUpDown className="size-3.5 text-muted-foreground" /> : null}
                        </button>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={13} className="py-10 text-center text-muted-foreground">
                    No tasks match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {tasks.length} tasks
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
