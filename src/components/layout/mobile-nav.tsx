"use client";

import { Menu } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-sidebar text-sidebar-foreground">
        <SheetHeader>
          <SheetTitle className="text-white">MF Ops Tracker</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <SidebarNav isAdmin={isAdmin} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
