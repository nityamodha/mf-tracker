import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardCard } from "@/types/app";

export function MetricsGrid({ cards }: { cards: DashboardCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="data-kpi">{card.value}</div>
            <p className="mt-2 text-xs text-muted-foreground">{card.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
