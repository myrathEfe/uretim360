"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet, apiPatch } from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import type { Alert } from "@/types/alert";

export default function AlertsPage() {
  const { data: session } = useSession();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const load = async () => {
    if (!session?.user.accessToken) {
      return;
    }

    const unread = await apiGet<{ count: number }>("/api/alerts/unread-count", session.user.accessToken);
    setUnreadCount(unread.count);
    if (session.user.role !== "OPERATOR") {
      const data = await apiGet<Alert[]>("/api/alerts", session.user.accessToken);
      setAlerts(data);
    }
  };

  useEffect(() => {
    void load();
  }, [session?.user.accessToken, session?.user.role]);

  const markRead = async (id: number) => {
    if (!session?.user.accessToken) {
      return;
    }
    await apiPatch(`/api/alerts/${id}/read`, undefined, session.user.accessToken);
    await load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Uyarılar" description="Fire, uzun arıza ve duruş uyarıları buradan takip edilir." />
      <Card>
        <CardHeader>
          <CardTitle>Özet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold text-slate-900">{unreadCount}</p>
          <p className="mt-2 text-sm text-slate-500">Okunmamış uyarı</p>
        </CardContent>
      </Card>
      {session?.user.role === "OPERATOR" ? (
        <Card>
          <CardContent>Operatör rolü için tam uyarı listesi kapalıdır. Sayaç ve işlem bazlı bilgilendirme üst çubukta gösterilir.</CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Uyarı Akışı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{alert.message}</p>
                    <p className="mt-1 text-sm text-slate-500">{alert.machineName ?? "Makine yok"} / {alert.departmentName ?? "Bölüm yok"}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(alert.createdAt)}</p>
                  </div>
                  {!alert.isRead ? <Button variant="outline" onClick={() => markRead(alert.id)}>Okundu Yap</Button> : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

