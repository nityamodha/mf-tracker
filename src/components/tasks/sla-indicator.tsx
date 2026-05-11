import { Badge } from "@/components/ui/badge";
import { cn, formatTimeToSla, getSlaState, getSlaTone } from "@/lib/utils";

export function SlaIndicator({ slaDueAt, completedAt }: { slaDueAt?: string | null; completedAt?: string | null }) {
  const state = getSlaState(slaDueAt, completedAt);

  return (
    <Badge variant="outline" className={cn("font-medium normal-case tracking-normal", getSlaTone(state))}>
      {state === "complete" ? "Complete" : formatTimeToSla(slaDueAt)}
    </Badge>
  );
}
