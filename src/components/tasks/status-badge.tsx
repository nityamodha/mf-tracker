import { Badge } from "@/components/ui/badge";
import { cn, getStatusLabel, getStatusTone } from "@/lib/utils";
import type { TaskStatus } from "@/types/app";

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant="outline" className={cn("font-medium normal-case tracking-normal", getStatusTone(status))}>{getStatusLabel(status)}</Badge>;
}
