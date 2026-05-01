"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/axios";
import { formatDate, formatNumber } from "@/lib/utils";
import type { MachineGridItem } from "@/types/machine";
import type { ProductionRecord } from "@/types/production";
import type { Shift } from "@/types/shift";

type RecordForm = {
  trackingCode: string;
  machineId: string;
  shiftId: string;
  inputQty: string;
  outputQty: string;
  notes: string;
};

const initialForm: RecordForm = {
  trackingCode: "",
  machineId: "",
  shiftId: "",
  inputQty: "1.000",
  outputQty: "0.950",
  notes: ""
};

export default function ProductionRecordsPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [machines, setMachines] = useState<MachineGridItem[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [form, setForm] = useState<RecordForm>({
    ...initialForm,
    trackingCode: "TXT-2026-00001"
  });

  const canCreate = session?.user.role === "SHIFT_SUPERVISOR" || session?.user.role === "OPERATOR";

  const load = async () => {
    if (!session?.user.accessToken) {
      return;
    }

    const [recordData, machineData, shiftData] = await Promise.all([
      apiGet<ProductionRecord[]>("/api/production-records", session.user.accessToken),
      apiGet<MachineGridItem[]>("/api/dashboard/machine-status", session.user.accessToken),
      apiGet<Shift[]>("/api/shifts", session.user.accessToken)
    ]);
    setRecords(recordData);
    setMachines(machineData);
    setShifts(shiftData);
    if (!editingRecordId && !form.machineId && machineData[0]) {
      setForm((current) => ({ ...current, machineId: String(machineData[0].machineId) }));
    }
  };

  useEffect(() => {
    void load();
  }, [session?.user.accessToken]);

  const resetForm = () => {
    setEditingRecordId(null);
    setForm({
      ...initialForm,
      machineId: machines[0] ? String(machines[0].machineId) : ""
    });
  };

  const saveRecord = async () => {
    if (!session?.user.accessToken || !form.trackingCode || !form.machineId) {
      return;
    }

    const material = await apiGet<{ id: number }>(`/api/materials/tracking/${form.trackingCode}`, session.user.accessToken);
    const payload = {
      materialId: material.id,
      machineId: Number(form.machineId),
      shiftId: form.shiftId ? Number(form.shiftId) : null,
      inputQty: Number(form.inputQty),
      outputQty: Number(form.outputQty),
      notes: form.notes
    };

    if (editingRecordId) {
      await apiPut(`/api/production-records/${editingRecordId}`, payload, session.user.accessToken);
    } else {
      await apiPost("/api/production-records", payload, session.user.accessToken);
    }
    await load();
    resetForm();
  };

  const startEdit = (record: ProductionRecord) => {
    setEditingRecordId(record.id);
    setForm({
      trackingCode: record.materialTrackingCode,
      machineId: String(record.machineId),
      shiftId: record.shiftId ? String(record.shiftId) : "",
      inputQty: String(record.inputQty),
      outputQty: String(record.outputQty),
      notes: record.notes ?? ""
    });
  };

  const removeRecord = async (id: number) => {
    if (!session?.user.accessToken || !window.confirm("Bu üretim kaydını silmek istiyor musunuz?")) {
      return;
    }
    await apiDelete(`/api/production-records/${id}`, session.user.accessToken);
    await load();
    if (editingRecordId === id) {
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Üretim Kayıtları" description="Makine ve malzeme bazında giriş-çıkış, fire ve vardiya kayıtları." />
      {canCreate || editingRecordId ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingRecordId ? "Kayıt Güncelle" : "Yeni Kayıt Ekle"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <Label>Malzeme Takip Kodu</Label>
              <Input value={form.trackingCode} onChange={(event) => setForm((current) => ({ ...current, trackingCode: event.target.value }))} />
            </div>
            <div>
              <Label>Makine</Label>
              <Select value={form.machineId} onChange={(event) => setForm((current) => ({ ...current, machineId: event.target.value }))}>
                {machines.map((machine) => (
                  <option key={machine.machineId} value={machine.machineId}>
                    {machine.machineName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Vardiya</Label>
              <Select value={form.shiftId} onChange={(event) => setForm((current) => ({ ...current, shiftId: event.target.value }))}>
                <option value="">Seçimsiz</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Girdi (ton)</Label>
              <Input value={form.inputQty} onChange={(event) => setForm((current) => ({ ...current, inputQty: event.target.value }))} />
            </div>
            <div>
              <Label>Çıktı (ton)</Label>
              <Input value={form.outputQty} onChange={(event) => setForm((current) => ({ ...current, outputQty: event.target.value }))} />
            </div>
            <div className="md:col-span-2 xl:col-span-3">
              <Label>Not</Label>
              <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
            </div>
            <div className="md:col-span-2 xl:col-span-3 flex gap-2">
              <Button onClick={saveRecord}>{editingRecordId ? "Güncelle" : "Kaydı Gönder"}</Button>
              {editingRecordId ? <Button variant="outline" onClick={resetForm}>Vazgeç</Button> : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Kayıt Listesi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{record.machineName}</p>
                  <p className="text-sm text-slate-500">{record.materialTrackingCode}</p>
                </div>
                <div className="text-right text-sm">
                  <p>Çıktı: {formatNumber(record.outputQty)} ton</p>
                  <p>Fire: %{formatNumber(record.wasteRate)}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">{record.notes ?? "Not girilmedi."}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>{formatDate(record.recordedAt)} / {record.recordedByName}</span>
                <button className="text-sm font-medium text-slate-700" onClick={() => startEdit(record)}>
                  Düzenle
                </button>
                <button className="text-sm font-medium text-red-700" onClick={() => void removeRecord(record.id)}>
                  Sil
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
