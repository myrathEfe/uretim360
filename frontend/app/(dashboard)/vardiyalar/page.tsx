"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet, apiPatch, apiPost } from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import type { Shift } from "@/types/shift";

export default function ShiftsPage() {
  const { data: session } = useSession();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [name, setName] = useState("Yeni Vardiya");
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));

  const load = async () => {
    if (!session?.user.accessToken) {
      return;
    }
    const data = await apiGet<Shift[]>("/api/shifts", session.user.accessToken);
    setShifts(data);
  };

  useEffect(() => {
    void load();
  }, [session?.user.accessToken]);

  const createShift = async () => {
    if (!session?.user.accessToken) {
      return;
    }
    await apiPost("/api/shifts", { name, startTime: new Date(startTime).toISOString() }, session.user.accessToken);
    await load();
  };

  const endShift = async (id: number) => {
    if (!session?.user.accessToken) {
      return;
    }
    await apiPatch(`/api/shifts/${id}/end`, undefined, session.user.accessToken);
    await load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Vardiyalar" description="Aktif vardiya akışını başlatın, izleyin ve gerektiğinde sonlandırın." />
      {(session?.user.role === "ADMIN" || session?.user.role === "SHIFT_SUPERVISOR") ? (
        <Card>
          <CardHeader>
            <CardTitle>Vardiya Oluştur</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div>
              <Label>Vardiya Adı</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <Label>Başlangıç</Label>
              <Input type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
            </div>
            <Button onClick={createShift}>Oluştur</Button>
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Vardiya Listesi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {shifts.map((shift) => (
            <div key={shift.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4">
              <div>
                <p className="font-semibold text-slate-900">{shift.name}</p>
                <p className="text-sm text-slate-500">{shift.supervisorName ?? "Şef atanmamış"}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(shift.startTime)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${shift.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {shift.isActive ? "Aktif" : "Kapalı"}
                </span>
                {shift.isActive && (session?.user.role === "ADMIN" || session?.user.role === "SHIFT_SUPERVISOR") ? (
                  <Button variant="outline" onClick={() => endShift(shift.id)}>
                    Vardiyayı Bitir
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

