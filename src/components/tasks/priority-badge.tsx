import { Badge } from "@/components/ui/badge";
import { cn, getPriorityLabel, getPriorityTone } from "@/lib/utils";
import type { TaskPriority } from "@/types/app";

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge variant="outline" className={cn("font-medium normal-case tracking-normal", getPriorityTone(priority))}>{getPriorityLabel(priority)}</Badge>;
}
