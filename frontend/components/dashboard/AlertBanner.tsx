import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Alert } from "@/types/alert";

export function AlertBanner({ alerts }: { alerts: Alert[] }) {
  const unread = alerts.filter((alert) => !alert.isRead).slice(0, 3);

  if (unread.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-amber-950">Aktif Uyarılar</h3>
          <Badge tone="warning">{unread.length} yeni kayıt</Badge>
        </div>
        <div className="space-y-2">
          {unread.map((alert) => (
            <div key={alert.id} className="rounded-2xl bg-white/80 p-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-900">{alert.message}</p>
                <Badge tone={alert.severity === "CRITICAL" ? "danger" : "warning"}>{alert.severity}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">{formatDate(alert.createdAt)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

