import { LogOut } from "lucide-react";

import { logoutAction } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/utils";
import type { UserProfile } from "@/types/app";

export function UserMenu({ profile }: { profile: UserProfile }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-left">
          <Avatar className="size-8">
            <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{profile.full_name}</p>
            <p className="text-xs text-muted-foreground">{profile.role.replace("_", " ")}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{profile.full_name}</p>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
        </div>
        <DropdownMenuItem asChild>
          <form action={logoutAction} className="w-full">
            <Button type="submit" variant="ghost" className="w-full justify-start px-2">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
