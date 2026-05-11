"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createUserAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUserSchema } from "@/lib/validators/user";
import type { UserRole } from "@/types/app";

type UserFormValues = {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  team?: string | null;
};

export function UserCreateDialog() {
  const [pending, startTransition] = useTransition();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      role: "mid_office",
      team: "",
    },
  });

  const onSubmit = (values: UserFormValues) => {
    startTransition(async () => {
      const result = await createUserAction(values);
      if (!result.success) {
        toast.error(result.error ?? "Unable to create user.");
        return;
      }

      toast.success("User created.");
      form.reset();
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create App User</DialogTitle>
          <DialogDescription>Admins create login credentials directly. No invite flow is used in this MVP.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="full_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Temporary Password</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">admin</SelectItem>
                    <SelectItem value="rm">rm</SelectItem>
                    <SelectItem value="mid_office">mid_office</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="team" render={({ field }) => (
              <FormItem>
                <FormLabel>Team</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="Mumbai Ops / RM West" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-end">
              <Button type="submit" disabled={pending}>{pending ? "Creating..." : "Create User"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
