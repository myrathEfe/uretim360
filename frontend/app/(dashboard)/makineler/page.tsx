"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/common/PageHeader";
import { MachineStatusActions } from "@/components/machines/MachineStatusActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/axios";
import { formatDate, statusLabel } from "@/lib/utils";
import type { Department } from "@/types/department";
import type { Machine, MachineGridItem, MachineStatus } from "@/types/machine";

type MachineForm = {
  departmentId: string;
  name: string;
  serialNumber: string;
  status: MachineStatus;
  isActive: boolean;
};

const initialForm: MachineForm = {
  departmentId: "",
  name: "",
  serialNumber: "",
  status: "RUNNING",
  isActive: true
};

export default function MachinesPage() {
  const { data: session } = useSession();
  const role = session?.user.role;
  const canManage = role === "ADMIN";
  const scoped = role === "SHIFT_SUPERVISOR" || role === "OPERATOR";
  const [machines, setMachines] = useState<Machine[] | MachineGridItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMachineId, setEditingMachineId] = useState<number | null>(null);
  const [form, setForm] = useState<MachineForm>(initialForm);

  const load = async () => {
    if (!session?.user.accessToken || !role) {
      return;
    }

    setLoading(true);
    if (scoped) {
      const data = await apiGet<MachineGridItem[]>("/api/dashboard/machine-status", session.user.accessToken);
      setMachines(data);
      setLoading(false);
      return;
    }

    const machineData = await apiGet<Machine[]>("/api/machines", session.user.accessToken);
    setMachines(machineData);
    if (canManage) {
      const departmentData = await apiGet<Department[]>("/api/departments", session.user.accessToken);
      setDepartments(departmentData);
      if (!editingMachineId && !form.departmentId && departmentData[0]) {
        setForm((current) => ({ ...current, departmentId: String(departmentData[0].id) }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [session?.user.accessToken, role]);

  const typedMachines = useMemo(() => machines as (Machine | MachineGridItem)[], [machines]);

  const resetForm = () => {
    setEditingMachineId(null);
    setForm({
      ...initialForm,
      departmentId: departments[0] ? String(departments[0].id) : ""
    });
  };

  const saveMachine = async () => {
    if (!session?.user.accessToken || !form.departmentId || !form.name.trim()) {
      return;
    }

    const payload = {
      departmentId: Number(form.departmentId),
      name: form.name.trim(),
      serialNumber: form.serialNumber.trim() || null,
      status: form.status,
      isActive: form.isActive
    };

    if (editingMachineId) {
      await apiPut(`/api/machines/${editingMachineId}`, payload, session.user.accessToken);
    } else {
      await apiPost("/api/machines", payload, session.user.accessToken);
    }

    await load();
    resetForm();
  };

  const startEdit = (machine: Machine) => {
    setEditingMachineId(machine.id);
    setForm({
      departmentId: String(machine.departmentId),
      name: machine.name,
      serialNumber: machine.serialNumber ?? "",
      status: machine.status,
      isActive: machine.isActive
    });
  };

  const removeMachine = async (machineId: number) => {
    if (!session?.user.accessToken || !window.confirm("Bu makineyi pasife almak istiyor musunuz?")) {
      return;
    }
    await apiDelete(`/api/machines/${machineId}`, session.user.accessToken);
    await load();
    if (editingMachineId === machineId) {
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Makineler"
        description="Canlı makine durumu, son hareket zamanı ve gerekli aksiyonlar burada yönetilir."
        action={canManage ? <Button onClick={resetForm}>{editingMachineId ? "Yeni Form" : "Formu Temizle"}</Button> : null}
      />
      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingMachineId ? "Makine Güncelle" : "Yeni Makine"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <Label>Makine Adı</Label>
              <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div>
              <Label>Seri No</Label>
              <Input value={form.serialNumber} onChange={(event) => setForm((current) => ({ ...current, serialNumber: event.target.value }))} />
            </div>
            <div>
              <Label>Bölüm</Label>
              <Select value={form.departmentId} onChange={(event) => setForm((current) => ({ ...current, departmentId: event.target.value }))}>
                <option value="">Bölüm seçin</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Durum</Label>
              <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as MachineStatus }))}>
                <option value="RUNNING">RUNNING</option>
                <option value="STOPPED">STOPPED</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="FAULT">FAULT</option>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={saveMachine}>{editingMachineId ? "Güncelle" : "Kaydet"}</Button>
              {editingMachineId ? <Button variant="outline" onClick={resetForm}>Vazgeç</Button> : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
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
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/makineler/${machineId}`} className="text-sm font-medium text-amber-700">
                      Detayı aç
                    </Link>
                    {canManage && "id" in machine ? (
                      <>
                        <button className="text-sm font-medium text-slate-700" onClick={() => startEdit(machine)}>
                          Düzenle
                        </button>
                        <button className="text-sm font-medium text-red-700" onClick={() => void removeMachine(machine.id)}>
                          Sil
                        </button>
                      </>
                    ) : null}
                  </div>
                  {(role === "SHIFT_SUPERVISOR" || role === "OPERATOR") && session?.user.accessToken ? (
                    <MachineStatusActions machineId={machineId} accessToken={session.user.accessToken} onDone={load} />
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
