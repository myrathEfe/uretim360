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

const initialForm = {
  name: "",
  sectorType: "TEXTILE" as Department["sectorType"],
  displayOrder: "1"
};

export default function DepartmentsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "ADMIN";
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    if (!session?.user.accessToken) {
      return;
    }
    const data = await apiGet<Department[]>("/api/departments", session.user.accessToken);
    setDepartments(data);
  };

  useEffect(() => {
    void load();
  }, [session?.user.accessToken]);

  const resetForm = () => {
    setEditingDepartmentId(null);
    setForm({
      ...initialForm,
      displayOrder: String(departments.length + 1)
    });
  };

  useEffect(() => {
    if (!editingDepartmentId) {
      setForm((current) => ({
        ...current,
        displayOrder: current.displayOrder || String(departments.length + 1)
      }));
    }
  }, [departments.length, editingDepartmentId]);

  const saveDepartment = async () => {
    if (!session?.user.accessToken || !form.name.trim()) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      sectorType: form.sectorType,
      displayOrder: Number(form.displayOrder) || 1,
      isActive: true
    };

    if (editingDepartmentId) {
      await apiPut(`/api/departments/${editingDepartmentId}`, payload, session.user.accessToken);
    } else {
      await apiPost("/api/departments", payload, session.user.accessToken);
    }

    await load();
    resetForm();
  };

  const startEdit = (department: Department) => {
    setEditingDepartmentId(department.id);
    setForm({
      name: department.name,
      sectorType: department.sectorType,
      displayOrder: String(department.displayOrder)
    });
  };

  const removeDepartment = async (id: number) => {
    if (!session?.user.accessToken || !window.confirm("Bu bölümü pasife almak istiyor musunuz?")) {
      return;
    }
    await apiDelete(`/api/departments/${id}`, session.user.accessToken);
    await load();
    if (editingDepartmentId === id) {
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bölümler"
        description="Tekstil üretim hattındaki departmanların sırası, kapsamı ve makine dağılımı."
        action={isAdmin ? <Button onClick={resetForm}>{editingDepartmentId ? "Yeni Form" : "Formu Temizle"}</Button> : null}
      />
      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingDepartmentId ? "Bölüm Güncelle" : "Yeni Bölüm"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <Label>Bölüm Adı</Label>
              <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div>
              <Label>Sektör</Label>
              <Select
                value={form.sectorType}
                onChange={(event) => setForm((current) => ({ ...current, sectorType: event.target.value as Department["sectorType"] }))}
              >
                <option value="TEXTILE">TEXTILE</option>
                <option value="FOOD">FOOD</option>
                <option value="METAL">METAL</option>
                <option value="PLASTIC">PLASTIC</option>
              </Select>
            </div>
            <div>
              <Label>Sıra</Label>
              <Input value={form.displayOrder} onChange={(event) => setForm((current) => ({ ...current, displayOrder: event.target.value }))} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={saveDepartment}>{editingDepartmentId ? "Güncelle" : "Kaydet"}</Button>
              {editingDepartmentId ? <Button variant="outline" onClick={resetForm}>Vazgeç</Button> : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {departments.map((department) => (
          <Card key={department.id}>
            <CardHeader>
              <CardTitle>{department.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-500">Sıra: {department.displayOrder}</p>
              <p className="text-sm text-slate-500">Sektör: {department.sectorType}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/bolumler/${department.id}`} className="text-sm font-medium text-amber-700">
                  Makineleri Gör
                </Link>
                {isAdmin ? (
                  <>
                    <button className="text-sm font-medium text-slate-700" onClick={() => startEdit(department)}>
                      Düzenle
                    </button>
                    <button className="text-sm font-medium text-red-700" onClick={() => void removeDepartment(department.id)}>
                      Sil
                    </button>
                  </>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
