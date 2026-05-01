"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/axios";
import type { Department } from "@/types/department";
import type { Machine } from "@/types/machine";
import type { Material, MaterialType } from "@/types/material";

type MaterialForm = {
  name: string;
  materialType: MaterialType;
  currentDepartmentId: string;
  currentMachineId: string;
  isCompleted: boolean;
};

const initialCreateForm: MaterialForm = {
  name: "",
  materialType: "RAW_MATERIAL",
  currentDepartmentId: "",
  currentMachineId: "",
  isCompleted: false
};

export default function MaterialsPage() {
  const { data: session } = useSession();
  const canList = session?.user.role === "ADMIN" || session?.user.role === "FACTORY_MANAGER";
  const canCreate = session?.user.role === "ADMIN" || session?.user.role === "SHIFT_SUPERVISOR";
  const canMutate = session?.user.role === "ADMIN" || session?.user.role === "SHIFT_SUPERVISOR";
  const [materials, setMaterials] = useState<Material[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [createMachines, setCreateMachines] = useState<Machine[]>([]);
  const [editMachines, setEditMachines] = useState<Machine[]>([]);
  const [trackingCode, setTrackingCode] = useState("");
  const [foundMaterial, setFoundMaterial] = useState<Material | null>(null);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState<MaterialForm>(initialCreateForm);
  const [editForm, setEditForm] = useState<MaterialForm>(initialCreateForm);

  const load = async () => {
    if (!session?.user.accessToken) {
      return;
    }

    const jobs: Promise<unknown>[] = [];
    if (canList) {
      jobs.push(apiGet<Material[]>("/api/materials", session.user.accessToken).then(setMaterials));
    }
    if (canCreate) {
      jobs.push(
        apiGet<Department[]>("/api/departments", session.user.accessToken).then((data) => {
          setDepartments(data);
          setCreateForm((current) => ({
            ...current,
            currentDepartmentId: current.currentDepartmentId || (data[0] ? String(data[0].id) : "")
          }));
        })
      );
    }
    await Promise.all(jobs);
  };

  useEffect(() => {
    void load();
  }, [session?.user.accessToken, canCreate, canList]);

  const loadMachinesForDepartment = async (departmentId: string, mode: "create" | "edit") => {
    if (!session?.user.accessToken || !departmentId) {
      if (mode === "create") {
        setCreateMachines([]);
      } else {
        setEditMachines([]);
      }
      return;
    }

    const data = await apiGet<Machine[]>(`/api/departments/${departmentId}/machines`, session.user.accessToken);
    if (mode === "create") {
      setCreateMachines(data);
      setCreateForm((current) => ({
        ...current,
        currentMachineId: data.some((machine) => String(machine.id) === current.currentMachineId) ? current.currentMachineId : ""
      }));
    } else {
      setEditMachines(data);
      setEditForm((current) => ({
        ...current,
        currentMachineId: data.some((machine) => String(machine.id) === current.currentMachineId) ? current.currentMachineId : ""
      }));
    }
  };

  useEffect(() => {
    if (canCreate && createForm.currentDepartmentId) {
      void loadMachinesForDepartment(createForm.currentDepartmentId, "create");
    }
  }, [createForm.currentDepartmentId, canCreate]);

  const lookup = async (code = trackingCode) => {
    if (!session?.user.accessToken || !code) {
      return;
    }
    const data = await apiGet<Material>(`/api/materials/tracking/${code}`, session.user.accessToken);
    setFoundMaterial(data);
    setTrackingCode(data.trackingCode);
  };

  const resetEdit = () => {
    setEditingMaterialId(null);
    setFoundMaterial(null);
    setEditForm(initialCreateForm);
  };

  const createMaterial = async () => {
    if (!session?.user.accessToken || !createForm.name.trim() || !createForm.currentDepartmentId) {
      return;
    }
    await apiPost(
      "/api/materials",
      {
        name: createForm.name.trim(),
        materialType: createForm.materialType,
        currentDepartmentId: Number(createForm.currentDepartmentId),
        currentMachineId: createForm.currentMachineId ? Number(createForm.currentMachineId) : null
      },
      session.user.accessToken
    );
    await load();
    setCreateForm((current) => ({
      ...initialCreateForm,
      currentDepartmentId: current.currentDepartmentId
    }));
  };

  const startEdit = async (material: Material) => {
    setEditingMaterialId(material.id);
    setFoundMaterial(material);
    setEditForm({
      name: material.name,
      materialType: material.materialType,
      currentDepartmentId: material.currentDepartmentId ? String(material.currentDepartmentId) : "",
      currentMachineId: material.currentMachineId ? String(material.currentMachineId) : "",
      isCompleted: material.isCompleted
    });
    if (material.currentDepartmentId) {
      await loadMachinesForDepartment(String(material.currentDepartmentId), "edit");
    }
  };

  const updateMaterial = async () => {
    if (!session?.user.accessToken || !editingMaterialId || !editForm.name.trim() || !editForm.currentDepartmentId) {
      return;
    }
    await apiPut(
      `/api/materials/${editingMaterialId}`,
      {
        name: editForm.name.trim(),
        currentDepartmentId: Number(editForm.currentDepartmentId),
        currentMachineId: editForm.currentMachineId ? Number(editForm.currentMachineId) : null,
        isCompleted: editForm.isCompleted
      },
      session.user.accessToken
    );
    await load();
    await lookup(trackingCode || foundMaterial?.trackingCode || "");
  };

  const removeMaterial = async (id: number) => {
    if (!session?.user.accessToken || !window.confirm("Bu malzemeyi silmek istiyor musunuz?")) {
      return;
    }
    await apiDelete(`/api/materials/${id}`, session.user.accessToken);
    await load();
    if (editingMaterialId === id) {
      resetEdit();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Malzemeler" description="Fiziksel lotlar için takip kodu, pozisyon ve üretim toplamları." />
      <Card>
        <CardHeader>
          <CardTitle>Takip Koduna Göre Arama</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Label>Takip Kodu</Label>
            <Input value={trackingCode} onChange={(event) => setTrackingCode(event.target.value)} placeholder="TXT-2026-00001" />
          </div>
          <Button onClick={() => lookup()}>Sorgula</Button>
          {foundMaterial ? (
            <div className="md:col-span-2 rounded-2xl bg-slate-50 p-4">
              <Link href={`/malzemeler/${foundMaterial.id}`} className="font-medium text-amber-700">
                {foundMaterial.trackingCode} - {foundMaterial.name}
              </Link>
              {canMutate ? (
                <div className="mt-3 flex gap-3 text-sm">
                  <button className="font-medium text-slate-700" onClick={() => void startEdit(foundMaterial)}>
                    Düzenle
                  </button>
                  <button className="font-medium text-red-700" onClick={() => void removeMaterial(foundMaterial.id)}>
                    Sil
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
      {canCreate ? (
        <Card>
          <CardHeader>
            <CardTitle>Yeni Malzeme</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <Label>Malzeme Adı</Label>
              <Input value={createForm.name} onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div>
              <Label>Malzeme Tipi</Label>
              <Select
                value={createForm.materialType}
                onChange={(event) => setCreateForm((current) => ({ ...current, materialType: event.target.value as MaterialType }))}
              >
                <option value="RAW_MATERIAL">RAW_MATERIAL</option>
                <option value="SEMI_PRODUCT">SEMI_PRODUCT</option>
                <option value="FINISHED_PRODUCT">FINISHED_PRODUCT</option>
              </Select>
            </div>
            <div>
              <Label>Bölüm</Label>
              <Select
                value={createForm.currentDepartmentId}
                onChange={(event) => setCreateForm((current) => ({ ...current, currentDepartmentId: event.target.value, currentMachineId: "" }))}
              >
                <option value="">Bölüm seçin</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Makine</Label>
              <Select
                value={createForm.currentMachineId}
                onChange={(event) => setCreateForm((current) => ({ ...current, currentMachineId: event.target.value }))}
              >
                <option value="">Makine seçimsiz</option>
                {createMachines.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={createMaterial}>Oluştur</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
      {canMutate && editingMaterialId && foundMaterial ? (
        <Card>
          <CardHeader>
            <CardTitle>Malzeme Güncelle</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <Label>Malzeme Adı</Label>
              <Input value={editForm.name} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div>
              <Label>Bölüm</Label>
              <Select
                value={editForm.currentDepartmentId}
                onChange={async (event) => {
                  const departmentId = event.target.value;
                  setEditForm((current) => ({ ...current, currentDepartmentId: departmentId, currentMachineId: "" }));
                  await loadMachinesForDepartment(departmentId, "edit");
                }}
              >
                <option value="">Bölüm seçin</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Makine</Label>
              <Select value={editForm.currentMachineId} onChange={(event) => setEditForm((current) => ({ ...current, currentMachineId: event.target.value }))}>
                <option value="">Makine seçimsiz</option>
                {editMachines.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Durum</Label>
              <Select
                value={editForm.isCompleted ? "done" : "active"}
                onChange={(event) => setEditForm((current) => ({ ...current, isCompleted: event.target.value === "done" }))}
              >
                <option value="active">Aktif</option>
                <option value="done">Tamamlandı</option>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={updateMaterial}>Güncelle</Button>
              <Button variant="outline" onClick={resetEdit}>Vazgeç</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
      {canList ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {materials.map((material) => (
            <Card key={material.id}>
              <CardContent className="space-y-2">
                <p className="font-semibold text-slate-900">{material.trackingCode}</p>
                <p className="text-sm text-slate-500">{material.name}</p>
                <p className="text-sm text-slate-600">{material.currentDepartmentName ?? "Bölüm yok"}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href={`/malzemeler/${material.id}`} className="text-sm font-medium text-amber-700">
                    Geçmişi Gör
                  </Link>
                  {canMutate ? (
                    <>
                      <button className="text-sm font-medium text-slate-700" onClick={() => void startEdit(material)}>
                        Düzenle
                      </button>
                      <button className="text-sm font-medium text-red-700" onClick={() => void removeMaterial(material.id)}>
                        Sil
                      </button>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
