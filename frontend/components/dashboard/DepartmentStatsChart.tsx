import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { DepartmentStatItem } from "@/types/dashboard";

export function DepartmentStatsChart({ data }: { data: DepartmentStatItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bölüm Performansları</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.departmentId}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-800">{item.departmentName}</span>
                <span className="text-slate-500">%{formatNumber(item.wasteRate)}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-gradient-to-r from-ink to-amber-500" style={{ width: `${Math.min(item.wasteRate, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

