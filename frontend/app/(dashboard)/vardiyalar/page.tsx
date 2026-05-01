"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import type { Shift } from "@/types/shift";
import type { User } from "@/types/user";

type ShiftForm = {
  name: string;
  startTime: string;
  supervisorId: string;
  status: "active" | "closed";
};

const toDateTimeLocal = (value?: string | null) => (value ? new Date(value).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));

export default function ShiftsPage() {
  const { data: session } = useSession();
  const canManage = session?.user.role === "ADMIN" || session?.user.role === "SHIFT_SUPERVISOR";
  const isAdmin = session?.user.role === "ADMIN";
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [editingShiftId, setEditingShiftId] = useState<number | null>(null);
  const [form, setForm] = useState<ShiftForm>({
    name: "Yeni Vardiya",
    startTime: new Date().toISOString().slice(0, 16),
    supervisorId: "",
    status: "active"
  });

  const load = async () => {
    if (!session?.user.accessToken) {
      return;
    }
    const data = await apiGet<Shift[]>("/api/shifts", session.user.accessToken);
    setShifts(data);
    if (isAdmin) {
      const users = await apiGet<User[]>("/api/users", session.user.accessToken);
      const shiftSupervisors = users.filter((user) => user.role === "SHIFT_SUPERVISOR");
      setSupervisors(shiftSupervisors);
      if (!editingShiftId && !form.supervisorId && shiftSupervisors[0]) {
        setForm((current) => ({ ...current, supervisorId: String(shiftSupervisors[0].id) }));
      }
    }
  };

  useEffect(() => {
    void load();
  }, [session?.user.accessToken, isAdmin]);

  const resetForm = () => {
    setEditingShiftId(null);
    setForm({
      name: "Yeni Vardiya",
      startTime: new Date().toISOString().slice(0, 16),
      supervisorId: supervisors[0] ? String(supervisors[0].id) : "",
      status: "active"
    });
  };

  const saveShift = async () => {
    if (!session?.user.accessToken) {
      return;
    }

    if (editingShiftId) {
      const existing = shifts.find((shift) => shift.id === editingShiftId);
      await apiPut(
        `/api/shifts/${editingShiftId}`,
        {
          name: form.name,
          startTime: new Date(form.startTime).toISOString(),
          supervisorId: isAdmin && form.supervisorId ? Number(form.supervisorId) : null,
          endTime: form.status === "closed" ? (existing?.endTime ?? new Date().toISOString()) : null,
          isActive: form.status === "active"
        },
        session.user.accessToken
      );
    } else {
      await apiPost(
        "/api/shifts",
        {
          name: form.name,
          startTime: new Date(form.startTime).toISOString(),
          supervisorId: isAdmin && form.supervisorId ? Number(form.supervisorId) : null
        },
        session.user.accessToken
      );
    }
    await load();
    resetForm();
  };

  const startEdit = (shift: Shift) => {
    setEditingShiftId(shift.id);
    setForm({
      name: shift.name,
      startTime: toDateTimeLocal(shift.startTime),
      supervisorId: shift.supervisorId ? String(shift.supervisorId) : "",
      status: shift.isActive ? "active" : "closed"
    });
  };

  const endShift = async (id: number) => {
    if (!session?.user.accessToken) {
      return;
    }
    await apiPatch(`/api/shifts/${id}/end`, undefined, session.user.accessToken);
    await load();
    if (editingShiftId === id) {
      resetForm();
    }
  };

  const removeShift = async (id: number) => {
    if (!session?.user.accessToken || !window.confirm("Bu vardiyayı silmek istiyor musunuz?")) {
      return;
    }
    await apiDelete(`/api/shifts/${id}`, session.user.accessToken);
    await load();
    if (editingShiftId === id) {
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vardiyalar"
        description="Aktif vardiya akışını başlatın, izleyin ve gerektiğinde sonlandırın."
        action={canManage ? <Button onClick={resetForm}>{editingShiftId ? "Yeni Form" : "Formu Temizle"}</Button> : null}
      />
      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingShiftId ? "Vardiya Güncelle" : "Vardiya Oluştur"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <Label>Vardiya Adı</Label>
              <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div>
              <Label>Başlangıç</Label>
              <Input type="datetime-local" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} />
            </div>
            {isAdmin ? (
              <div>
                <Label>Vardiya Şefi</Label>
                <Select value={form.supervisorId} onChange={(event) => setForm((current) => ({ ...current, supervisorId: event.target.value }))}>
                  <option value="">Şef seçin</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.fullName}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
            {editingShiftId ? (
              <div>
                <Label>Durum</Label>
                <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ShiftForm["status"] }))}>
                  <option value="active">Aktif</option>
                  <option value="closed">Kapalı</option>
                </Select>
              </div>
            ) : null}
            <div className="flex items-end gap-2">
              <Button onClick={saveShift}>{editingShiftId ? "Güncelle" : "Oluştur"}</Button>
              {editingShiftId ? <Button variant="outline" onClick={resetForm}>Vazgeç</Button> : null}
            </div>
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
                {canManage ? (
                  <>
                    <Button variant="outline" onClick={() => startEdit(shift)}>
                      Düzenle
                    </Button>
                    {shift.isActive ? (
                      <Button variant="outline" onClick={() => endShift(shift.id)}>
                        Vardiyayı Bitir
                      </Button>
                    ) : null}
                    <Button variant="destructive" onClick={() => void removeShift(shift.id)}>
                      Sil
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
