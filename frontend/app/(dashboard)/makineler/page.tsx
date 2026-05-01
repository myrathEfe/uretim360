"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { MachineStatusActions } from "@/components/machines/MachineStatusActions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMachines } from "@/hooks/useMachines";
import { formatDate, statusLabel } from "@/lib/utils";
import type { Machine, MachineGridItem } from "@/types/machine";

export default function MachinesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user.role;
  const scoped = role === "SHIFT_SUPERVISOR" || role === "OPERATOR";
  const { machines, loading } = useMachines(session?.user.accessToken, scoped);

  const typedMachines = useMemo(() => machines as (Machine | MachineGridItem)[], [machines]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Makineler"
        description="Canlı makine durumu, son hareket zamanı ve gerekli aksiyonlar burada yönetilir."
      />
      {loading ? (
        <p className="text-sm text-slate-600">Makine verileri yükleniyor...</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {typedMachines.map((machine) => {
            const machineId = "machineId" in machine ? machine.machineId : machine.id;
            const machineName = "machineName" in machine ? machine.machineName : machine.name;
            const departmentName = machine.departmentName;
            const status = machine.status;
            const statusSince = machine.statusSince;
            const materialCode = "materialTrackingCode" in machine ? machine.materialTrackingCode : null;

            return (
              <Card key={machineId}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{machineName}</CardTitle>
                      <p className="mt-1 text-sm text-slate-500">{departmentName}</p>
                    </div>
                    <Badge tone={status === "FAULT" ? "danger" : status === "RUNNING" ? "success" : "warning"}>
                      {statusLabel(status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                    <p>Durum başlangıcı: {formatDate(statusSince)}</p>
                    <p className="mt-1">Aktif malzeme: {materialCode ?? "Bilinmiyor"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/makineler/${machineId}`} className="text-sm font-medium text-amber-700">
                      Detayı aç
                    </Link>
                  </div>
                  {(role === "SHIFT_SUPERVISOR" || role === "OPERATOR") && session?.user.accessToken ? (
                    <MachineStatusActions machineId={machineId} accessToken={session.user.accessToken} onDone={() => router.refresh()} />
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

