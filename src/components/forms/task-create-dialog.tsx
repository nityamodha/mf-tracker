"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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

const OTHER_OPTION = "__other__";

export function TaskCreateDialog({ lookups }: { lookups: TaskLookupData }) {
  const [pending, startTransition] = useTransition();
  const [customFields, setCustomFields] = useState({
    client: false,
    channelPartner: false,
    rm: false,
    assignedTo: false,
    taskType: false,
    amc: false,
  });
  const form = useForm<CreateTaskSchema>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      client_name: "",
      channel_partner_name: "",
      rm_name: "",
      assigned_to_name: lookups.users[0]?.full_name ?? "",
      task_type_name: lookups.taskTypes[0]?.name ?? "",
      amc_name: lookups.amcs[0]?.name ?? "",
      priority: "medium",
      due_date: "",
      description: "",
    },
  });
  const clientValue = useWatch({ control: form.control, name: "client_name" });
  const channelPartnerValue = useWatch({ control: form.control, name: "channel_partner_name" });
  const rmValue = useWatch({ control: form.control, name: "rm_name" });
  const assignedToValue = useWatch({ control: form.control, name: "assigned_to_name" });
  const taskTypeValue = useWatch({ control: form.control, name: "task_type_name" });
  const amcValue = useWatch({ control: form.control, name: "amc_name" });

  const clientOptions = useMemo(() => lookups.clients.map((item) => item.client_name), [lookups.clients]);
  const channelPartnerOptions = useMemo(() => lookups.channelPartners.map((item) => item.partner_name), [lookups.channelPartners]);
  const rmOptions = useMemo(
    () => lookups.users.filter((user) => user.role === "rm").map((user) => user.full_name),
    [lookups.users],
  );
  const assigneeOptions = useMemo(() => lookups.users.map((user) => user.full_name), [lookups.users]);
  const taskTypeOptions = useMemo(() => lookups.taskTypes.map((item) => item.name), [lookups.taskTypes]);
  const amcOptions = useMemo(() => lookups.amcs.map((item) => item.name), [lookups.amcs]);

  const getSelectValue = (value: string, isCustom: boolean) => {
    if (isCustom) return OTHER_OPTION;
    return value || undefined;
  };

  const onSubmit = (values: CreateTaskSchema) => {
    startTransition(async () => {
      const result = await createTaskAction(values);

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
          <DialogDescription>Select existing values or choose Other to create new ones inline. Nothing here should block quick task creation.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      if (value === OTHER_OPTION) {
                        setCustomFields((current) => ({ ...current, client: true }));
                        field.onChange("");
                        return;
                      }
                      setCustomFields((current) => ({ ...current, client: false }));
                      field.onChange(value);
                    }}
                    value={getSelectValue(clientValue, customFields.client)}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientOptions.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                      <SelectItem value={OTHER_OPTION}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {customFields.client ? (
                    <FormControl>
                      <Input
                        placeholder="Enter client name"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="channel_partner_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Partner</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      if (value === OTHER_OPTION) {
                        setCustomFields((current) => ({ ...current, channelPartner: true }));
                        field.onChange("");
                        return;
                      }
                      setCustomFields((current) => ({ ...current, channelPartner: false }));
                      field.onChange(value);
                    }}
                    value={getSelectValue(channelPartnerValue, customFields.channelPartner)}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {channelPartnerOptions.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                      <SelectItem value={OTHER_OPTION}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {customFields.channelPartner ? (
                    <FormControl>
                      <Input
                        placeholder="Enter channel partner"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rm_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship Manager</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      if (value === OTHER_OPTION) {
                        setCustomFields((current) => ({ ...current, rm: true }));
                        field.onChange("");
                        return;
                      }
                      setCustomFields((current) => ({ ...current, rm: false }));
                      field.onChange(value);
                    }}
                    value={getSelectValue(rmValue, customFields.rm)}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select RM" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rmOptions.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                      <SelectItem value={OTHER_OPTION}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {customFields.rm ? (
                    <FormControl>
                      <Input
                        placeholder="Enter RM name or email"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assigned_to_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      if (value === OTHER_OPTION) {
                        setCustomFields((current) => ({ ...current, assignedTo: true }));
                        field.onChange("");
                        return;
                      }
                      setCustomFields((current) => ({ ...current, assignedTo: false }));
                      field.onChange(value);
                    }}
                    value={getSelectValue(assignedToValue, customFields.assignedTo)}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assigneeOptions.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                      <SelectItem value={OTHER_OPTION}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {customFields.assignedTo ? (
                    <FormControl>
                      <Input
                        placeholder="Enter assignee name or email"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="task_type_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      if (value === OTHER_OPTION) {
                        setCustomFields((current) => ({ ...current, taskType: true }));
                        field.onChange("");
                        return;
                      }

                      setCustomFields((current) => ({ ...current, taskType: false }));
                      field.onChange(value);
                    }}
                    value={getSelectValue(taskTypeValue, customFields.taskType)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {taskTypeOptions.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                      <SelectItem value={OTHER_OPTION}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {customFields.taskType ? (
                    <FormControl>
                      <Input
                        placeholder="Enter custom task type"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amc_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AMC</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      if (value === OTHER_OPTION) {
                        setCustomFields((current) => ({ ...current, amc: true }));
                        field.onChange("");
                        return;
                      }
                      setCustomFields((current) => ({ ...current, amc: false }));
                      field.onChange(value);
                    }}
                    value={getSelectValue(amcValue, customFields.amc)}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select AMC" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {amcOptions.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                      <SelectItem value={OTHER_OPTION}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {customFields.amc ? (
                    <FormControl>
                      <Input
                        placeholder="Enter AMC name"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                  ) : null}
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
                      <Textarea placeholder="Describe the servicing request, received documents, or just leave a quick note." {...field} />
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
