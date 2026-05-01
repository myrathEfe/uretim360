"use client";

import { useSession } from "next-auth/react";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { DepartmentStatsChart } from "@/components/dashboard/DepartmentStatsChart";
import { MachineStatusChart } from "@/components/dashboard/MachineStatusChart";
import { ProductionTrendChart } from "@/components/dashboard/ProductionTrendChart";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard, useScopedDashboard } from "@/hooks/useDashboard";
import { formatNumber, formatDate, statusLabel } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const isManagerView = session?.user.role === "ADMIN" || session?.user.role === "FACTORY_MANAGER";
  const { summary, trend, machineGrid, alerts, departmentStats, loading } = useDashboard(
    isManagerView ? session?.user.accessToken : undefined
  );
  const scoped = useScopedDashboard(!isManagerView ? session?.user.accessToken : undefined);

  if (isManagerView && (loading || !summary)) {
    return <div className="text-sm text-slate-600">Gösterge paneli yükleniyor...</div>;
  }

  if (!isManagerView) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Operasyon Panosu"
          description="Kendi bölümünüz veya atanmış makineleriniz için canlı makine görünümü ve uyarılar."
        />
        <AlertBanner alerts={scoped.alerts} />
        <Card>
          <CardHeader>
            <CardTitle>Makine Durum Izgarası</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {scoped.machineGrid.map((item) => (
              <div key={item.machineId} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-900">{item.machineName}</h3>
                  <Badge tone={item.status === "FAULT" ? "danger" : item.status === "RUNNING" ? "success" : "warning"}>
                    {statusLabel(item.status)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.departmentName}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">Aktif Malzeme</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{item.materialTrackingCode ?? "Atama yok"}</p>
                <p className="mt-4 text-xs text-slate-500">Durum başlangıcı: {formatDate(item.statusSince)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const summaryData = summary!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gösterge Paneli"
        description="Üretim, fire, uyarılar ve makine hareketleri tek merkezden izlenir."
      />
      <SummaryCards summary={summaryData.summary} />
      <AlertBanner alerts={alerts} />
      <div className="grid gap-6 xl:grid-cols-2">
        <ProductionTrendChart data={trend} />
        <MachineStatusChart data={summaryData.machineStatusCounts} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <DepartmentStatsChart data={departmentStats.length ? departmentStats : summaryData.departmentBreakdown} />
        <Card>
          <CardHeader>
            <CardTitle>En Yüksek Fireli 5 Makine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summaryData.topWasteMachines.map((item) => (
              <div key={item.machineId} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-medium text-slate-900">{item.machineName}</p>
                  <p className="text-sm text-slate-500">{item.departmentName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">%{formatNumber(item.wasteRate)}</p>
                  <p className="text-xs text-slate-500">{item.trend === "up" ? "Yükseliş" : item.trend === "down" ? "Düşüş" : "Sabit"}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Makine Durum Izgarası</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {machineGrid.map((item) => (
            <div key={item.machineId} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">{item.machineName}</h3>
                <Badge tone={item.status === "FAULT" ? "danger" : item.status === "RUNNING" ? "success" : "warning"}>
                  {statusLabel(item.status)}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">{item.departmentName}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">Aktif Malzeme</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{item.materialTrackingCode ?? "Atama yok"}</p>
              <p className="mt-4 text-xs text-slate-500">Durum başlangıcı: {formatDate(item.statusSince)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
