"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMachineDetail } from "@/hooks/useMachines";
import { formatDate, statusLabel } from "@/lib/utils";

export default function MachineDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: session } = useSession();
  const { machine, logs, loading } = useMachineDetail(params.id, session?.user.accessToken);

  if (loading || !machine) {
    return <p className="text-sm text-slate-600">Makine detayı yükleniyor...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={machine.name} description={`${machine.departmentName} bölümündeki makinenin detaylı durum kaydı.`} />
      <Card>
        <CardHeader>
          <CardTitle>Makine Bilgisi</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <p>Seri No: {machine.serialNumber ?? "Tanımsız"}</p>
          <p>Durum: {statusLabel(machine.status)}</p>
          <p>Bölüm: {machine.departmentName}</p>
          <p>Durum Başlangıcı: {formatDate(machine.statusSince)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Durum Geçmişi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-slate-100 p-4">
              <p className="font-medium text-slate-900">
                {log.oldStatus ? `${statusLabel(log.oldStatus)} → ` : ""}
                {statusLabel(log.newStatus)}
              </p>
              <p className="mt-1 text-sm text-slate-500">{log.changedByName}</p>
              <p className="mt-1 text-sm text-slate-600">{log.note ?? "Not girilmedi."}</p>
              <p className="mt-2 text-xs text-slate-500">
                {formatDate(log.startedAt)} {log.endedAt ? `- ${formatDate(log.endedAt)}` : "- devam ediyor"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

