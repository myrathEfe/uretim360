"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/axios";
import { statusLabel } from "@/lib/utils";
import type { Machine } from "@/types/machine";

export default function DepartmentDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [machines, setMachines] = useState<Machine[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!session?.user.accessToken) {
        return;
      }
      const data = await apiGet<Machine[]>(`/api/departments/${params.id}/machines`, session.user.accessToken);
      setMachines(data);
    };

    void load();
  }, [params.id, session?.user.accessToken]);

  return (
    <div className="space-y-6">
      <PageHeader title="Bölüm Detayı" description="Bu bölüme bağlı makinelerin anlık durum görünümü." />
      <div className="grid gap-4 md:grid-cols-2">
        {machines.map((machine) => (
          <Card key={machine.id}>
            <CardContent className="space-y-2">
              <p className="font-semibold text-slate-900">{machine.name}</p>
              <p className="text-sm text-slate-500">{machine.serialNumber}</p>
              <p className="text-sm text-slate-700">Durum: {statusLabel(machine.status)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

