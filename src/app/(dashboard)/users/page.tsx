import { redirect } from "next/navigation";

import { toggleUserActiveAction } from "@/app/actions";
import { UserCreateDialog } from "@/components/forms/user-create-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireUser } from "@/services/auth";
import { getUsers } from "@/services/users";

export default async function UsersPage() {
  const { profile } = await requireUser();
  if (profile.role !== "admin") redirect("/dashboard");

  const users = await getUsers();

  return (
    <div>
      <PageHeader title="Users" description="Create internal users, control access roles, and deactivate accounts when needed." actions={<UserCreateDialog />} />
      <div className="p-6">
        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.team ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={user.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-700"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <form
                        action={async () => {
                          "use server";
                          await toggleUserActiveAction({ userId: user.id, isActive: !user.is_active });
                        }}
                      >
                        <Button type="submit" variant="outline" size="sm">
                          {user.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
