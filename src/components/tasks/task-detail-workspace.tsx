"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Download, MessageSquarePlus, Paperclip, Save } from "lucide-react";
import { toast } from "sonner";

import { addTaskCommentAction, updateTaskAssignmentAction, updateTaskPriorityAction, updateTaskStatusAction, uploadTaskAttachmentAction } from "@/app/actions";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { SlaIndicator } from "@/components/tasks/sla-indicator";
import { StatusBadge } from "@/components/tasks/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useTaskRealtime } from "@/hooks/use-task-realtime";
import { formatAging, formatDateShort, formatDateTime } from "@/lib/utils";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/lib/utils/options";
import type { TaskDetail, UserProfile } from "@/types/app";

export function TaskDetailWorkspace({
  task,
  users,
}: {
  task: TaskDetail;
  users: UserProfile[];
}) {
  useTaskRealtime(task.id);

  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assignee, setAssignee] = useState(task.assigned_to ?? "");
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();

  const saveControls = () => {
    startTransition(async () => {
      const [statusResult, priorityResult, assignmentResult] = await Promise.all([
        updateTaskStatusAction({ taskId: task.id, status }),
        updateTaskPriorityAction({ taskId: task.id, priority }),
        updateTaskAssignmentAction({ taskId: task.id, assigned_to: assignee }),
      ]);

      const firstError = [statusResult, priorityResult, assignmentResult].find((result) => !result.success);
      if (firstError) {
        toast.error(firstError.error ?? "Unable to update task controls.");
        return;
      }

      toast.success("Task controls updated.");
    });
  };

  const submitComment = () => {
    startTransition(async () => {
      const result = await addTaskCommentAction({ taskId: task.id, comment });
      if (!result.success) {
        toast.error(result.error ?? "Unable to add comment.");
        return;
      }
      setComment("");
      toast.success("Comment added.");
    });
  };

  const submitAttachment = () => {
    if (!file) {
      toast.error("Choose a file first.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("taskId", task.id);
      formData.set("file", file);
      const result = await uploadTaskAttachmentAction(formData);
      if (!result.success) {
        toast.error(result.error ?? "Unable to upload attachment.");
        return;
      }
      setFile(null);
      toast.success("Attachment uploaded.");
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 xl:grid-cols-[1.6fr_0.8fr]">
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-mono text-xs font-semibold text-muted-foreground">{task.ticket_number}</p>
                <CardTitle className="mt-2 text-xl">{task.task_type?.name ?? "Operational Task"}</CardTitle>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{task.description ?? "No description captured."}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                <SlaIndicator slaDueAt={task.sla_due_at} completedAt={task.completed_at} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Client Information</p>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Name:</span> {task.client?.client_name ?? "—"}</p>
                <p><span className="text-muted-foreground">PAN:</span> {task.client?.pan_number ?? "—"}</p>
                <p><span className="text-muted-foreground">KYC:</span> {task.client?.kyc_status ?? "—"}</p>
                <p><span className="text-muted-foreground">Email:</span> {task.client?.email ?? "—"}</p>
                <p><span className="text-muted-foreground">Mobile:</span> {task.client?.mobile ?? "—"}</p>
              </div>
            </div>
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Task Metadata</p>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Partner:</span> {task.channel_partner?.partner_name ?? "—"}</p>
                <p><span className="text-muted-foreground">RM:</span> {task.rm?.full_name ?? "—"}</p>
                <p><span className="text-muted-foreground">AMC:</span> {task.amc?.name ?? "—"}</p>
                <p><span className="text-muted-foreground">Due Date:</span> {formatDateShort(task.due_date)}</p>
                <p><span className="text-muted-foreground">Aging:</span> {formatAging(task.created_at, task.completed_at)}</p>
                <p><span className="text-muted-foreground">Created:</span> {formatDateTime(task.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_STATUS_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as typeof priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITY_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={saveControls} disabled={pending}>
              <Save className="size-4" />
              Save Controls
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comments">
        <TabsList>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
          <TabsTrigger value="history">Status History</TabsTrigger>
        </TabsList>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Capture RM follow-up, document gaps, or AMC updates." />
                <div className="flex justify-end">
                  <Button onClick={submitComment} disabled={pending || !comment.trim()}>
                    <MessageSquarePlus className="size-4" />
                    Add Comment
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[320px]">
                <div className="space-y-3 pr-4">
                  {task.comments.map((item) => (
                    <div key={item.id} className="rounded-lg border p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{item.user?.full_name ?? "Unknown user"}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(item.created_at)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.comment}</p>
                    </div>
                  ))}
                  {!task.comments.length ? <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No comments logged yet.</div> : null}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
                <Button onClick={submitAttachment} disabled={pending}>
                  <Paperclip className="size-4" />
                  Upload File
                </Button>
              </div>
              <div className="space-y-3">
                {task.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{attachment.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded by {attachment.uploader?.full_name ?? "Unknown"} on {formatDateTime(attachment.created_at)}
                      </p>
                    </div>
                    {attachment.signed_url ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={attachment.signed_url} target="_blank">
                          <Download className="size-4" />
                          Download
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                ))}
                {!task.attachments.length ? <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No files uploaded yet.</div> : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {task.activity.map((entry) => (
                  <div key={entry.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{entry.actor?.full_name ?? "System"}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(entry.created_at)}</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {entry.action_type}
                      {entry.field_name ? ` • ${entry.field_name}` : ""}
                      {entry.old_value || entry.new_value ? ` • ${entry.old_value ?? "—"} → ${entry.new_value ?? "—"}` : ""}
                    </p>
                  </div>
                ))}
                {!task.activity.length ? <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No activity events recorded yet.</div> : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {task.activity
                  .filter((entry) => entry.field_name === "status")
                  .map((entry) => (
                    <div key={entry.id} className="rounded-lg border p-3 text-sm">
                      <p className="font-medium">{entry.old_value ?? "—"} to {entry.new_value ?? "—"}</p>
                      <p className="text-muted-foreground">
                        Changed by {entry.actor?.full_name ?? "System"} on {formatDateTime(entry.created_at)}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
