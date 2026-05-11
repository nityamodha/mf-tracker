"use client";

import { useMemo, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createTaskAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTaskSchema, type CreateTaskSchema } from "@/lib/validators/task";
import type { TaskLookupData } from "@/types/app";

export function TaskCreateDialog({ lookups }: { lookups: TaskLookupData }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<CreateTaskSchema>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      client_id: lookups.clients[0]?.id ?? "",
      channel_partner_id: lookups.channelPartners[0]?.id ?? null,
      rm_id: lookups.users.find((user) => user.role === "rm")?.id ?? lookups.users[0]?.id ?? "",
      assigned_to: lookups.users[0]?.id ?? "",
      task_type_id: lookups.taskTypes[0]?.id ?? "",
      amc_id: lookups.amcs[0]?.id ?? null,
      priority: "medium",
      due_date: "",
      description: "",
    },
  });

  const rmOptions = useMemo(() => lookups.users.filter((user) => user.role === "rm"), [lookups.users]);

  const onSubmit = (values: CreateTaskSchema) => {
    startTransition(async () => {
      const result = await createTaskAction({
        ...values,
        due_date: new Date(values.due_date).toISOString(),
      });

      if (!result.success) {
        toast.error(result.error ?? "Unable to create task.");
        return;
      }

      toast.success("Task created.");
      form.reset();
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Task</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Servicing Task</DialogTitle>
          <DialogDescription>Capture the request, assign ownership, and start SLA tracking in one step.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookups.clients.map((item) => (
                        <SelectItem key={item.id} value={item.id}>{item.client_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="channel_partner_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Partner</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookups.channelPartners.map((item) => (
                        <SelectItem key={item.id} value={item.id}>{item.partner_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rm_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship Manager</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select RM" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rmOptions.map((user) => (
                        <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookups.users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="task_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select task type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookups.taskTypes.map((item) => (
                        <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amc_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AMC</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select AMC" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookups.amcs.map((amc) => (
                        <SelectItem key={amc.id} value={amc.id}>{amc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["low", "medium", "high", "urgent"].map((priority) => (
                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the servicing request, received documents, and processing notes." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
