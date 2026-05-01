import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import type { SummaryCard } from "@/types/dashboard";

export function SummaryCards({ summary }: { summary: SummaryCard }) {
  const cards = [
    { title: "Toplam Üretim", value: `${formatNumber(summary.totalProduction)} ton`, hint: "Bugün" },
    { title: "Toplam Fire", value: `${formatNumber(summary.totalWaste)} ton`, hint: "Bugün" },
    { title: "Ortalama Fire Oranı", value: `%${formatNumber(summary.averageWasteRate, 2)}`, hint: "Günlük ortalama" },
    { title: "Arızalı Makine Sayısı", value: String(summary.faultyMachineCount), hint: "Canlı durum" }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              {card.title}
              {card.title === "Arızalı Makine Sayısı" && summary.faultyMachineCount > 0 ? <Badge tone="danger">Dikkat</Badge> : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">{card.value}</div>
            <p className="mt-2 text-sm text-slate-500">{card.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

