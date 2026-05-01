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
import { apiGet, apiPost } from "@/lib/axios";
import { formatDate, formatNumber } from "@/lib/utils";
import type { MachineGridItem } from "@/types/machine";
import type { ProductionRecord } from "@/types/production";
import type { Shift } from "@/types/shift";

export default function ProductionRecordsPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [machines, setMachines] = useState<MachineGridItem[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [trackingCode, setTrackingCode] = useState("TXT-2026-00001");
  const [machineId, setMachineId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [inputQty, setInputQty] = useState("1.000");
  const [outputQty, setOutputQty] = useState("0.950");
  const [notes, setNotes] = useState("");

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
    if (!machineId && machineData[0]) {
      setMachineId(String(machineData[0].machineId));
    }
  };

  useEffect(() => {
    void load();
  }, [session?.user.accessToken]);

  const createRecord = async () => {
    if (!session?.user.accessToken || !trackingCode || !machineId) {
      return;
    }
    const material = await apiGet<{ id: number }>(`/api/materials/tracking/${trackingCode}`, session.user.accessToken);
    await apiPost(
      "/api/production-records",
      {
        materialId: material.id,
        machineId: Number(machineId),
        shiftId: shiftId ? Number(shiftId) : null,
        inputQty: Number(inputQty),
        outputQty: Number(outputQty),
        notes
      },
      session.user.accessToken
    );
    await load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Üretim Kayıtları" description="Makine ve malzeme bazında giriş-çıkış, fire ve vardiya kayıtları." />
      {canCreate ? (
        <Card>
          <CardHeader>
            <CardTitle>Yeni Kayıt Ekle</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <Label>Malzeme Takip Kodu</Label>
              <Input value={trackingCode} onChange={(event) => setTrackingCode(event.target.value)} />
            </div>
            <div>
              <Label>Makine</Label>
              <Select value={machineId} onChange={(event) => setMachineId(event.target.value)}>
                {machines.map((machine) => (
                  <option key={machine.machineId} value={machine.machineId}>
                    {machine.machineName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Vardiya</Label>
              <Select value={shiftId} onChange={(event) => setShiftId(event.target.value)}>
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
              <Input value={inputQty} onChange={(event) => setInputQty(event.target.value)} />
            </div>
            <div>
              <Label>Çıktı (ton)</Label>
              <Input value={outputQty} onChange={(event) => setOutputQty(event.target.value)} />
            </div>
            <div className="md:col-span-2 xl:col-span-3">
              <Label>Not</Label>
              <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
            </div>
            <div className="md:col-span-2 xl:col-span-3">
              <Button onClick={createRecord}>Kaydı Gönder</Button>
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
              <p className="mt-2 text-xs text-slate-500">{formatDate(record.recordedAt)} / {record.recordedByName}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

