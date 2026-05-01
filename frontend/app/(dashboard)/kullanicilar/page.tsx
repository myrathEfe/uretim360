"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleBadge } from "@/components/common/RoleBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/axios";
import type { Department } from "@/types/department";
import type { Machine } from "@/types/machine";
import type { Role, User } from "@/types/user";

type UserForm = {
  email: string;
  fullName: string;
  password: string;
  role: Role;
  departmentId: string;
  machineIds: number[];
  isActive: boolean;
};

const initialForm: UserForm = {
  email: "",
  fullName: "",
  password: "Test1234!",
  role: "OPERATOR",
  departmentId: "",
  machineIds: [],
  isActive: true
};

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>(initialForm);

  const load = async () => {
    if (!session?.user.accessToken) {
      return;
    }
    const [userData, departmentData, machineData] = await Promise.all([
      apiGet<User[]>("/api/users", session.user.accessToken),
      apiGet<Department[]>("/api/departments", session.user.accessToken),
      apiGet<Machine[]>("/api/machines", session.user.accessToken)
    ]);
    setUsers(userData);
    setDepartments(departmentData);
    setMachines(machineData);
  };

  useEffect(() => {
    if (session?.user.role === "ADMIN") {
      void load();
    }
  }, [session?.user.accessToken, session?.user.role]);

  const visibleMachines = useMemo(() => {
    if (form.role !== "OPERATOR") {
      return [];
    }
    return machines;
  }, [form.role, machines]);

  const resetForm = () => {
    setEditingUserId(null);
    setForm(initialForm);
  };

  const toggleMachine = (machineId: number) => {
    setForm((current) => ({
      ...current,
      machineIds: current.machineIds.includes(machineId)
        ? current.machineIds.filter((id) => id !== machineId)
        : [...current.machineIds, machineId]
    }));
  };

  const saveUser = async () => {
    if (!session?.user.accessToken) {
      return;
    }

    const payload = {
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      password: form.password,
      role: form.role,
      departmentId: form.role === "SHIFT_SUPERVISOR" && form.departmentId ? Number(form.departmentId) : null,
      machineIds: form.role === "OPERATOR" ? form.machineIds : [],
      isActive: form.isActive
    };

    if (editingUserId) {
      await apiPut(`/api/users/${editingUserId}`, payload, session.user.accessToken);
    } else {
      await apiPost("/api/users", payload, session.user.accessToken);
    }

    await load();
    resetForm();
  };

  const startEdit = (user: User) => {
    setEditingUserId(user.id);
    setForm({
      email: user.email,
      fullName: user.fullName,
      password: "",
      role: user.role,
      departmentId: user.departmentId ? String(user.departmentId) : "",
      machineIds: user.assignedMachineIds,
      isActive: user.isActive
    });
  };

  const removeUser = async (id: number) => {
    if (!session?.user.accessToken || !window.confirm("Bu kullanıcıyı pasife almak istiyor musunuz?")) {
      return;
    }
    await apiDelete(`/api/users/${id}`, session.user.accessToken);
    await load();
    if (editingUserId === id) {
      resetForm();
    }
  };

  if (session?.user.role !== "ADMIN") {
    return <Card><CardContent>Bu sayfa yalnızca sistem yöneticilerine açıktır.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kullanıcılar"
        description="Rol ataması, aktivasyon ve operatör yetkilendirmeleri bu modülden yönetilir."
        action={<Button onClick={resetForm}>{editingUserId ? "Yeni Form" : "Formu Temizle"}</Button>}
      />
      <Card>
        <CardHeader>
          <CardTitle>{editingUserId ? "Kullanıcı Güncelle" : "Yeni Kullanıcı Oluştur"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <Label>Ad Soyad</Label>
            <Input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
          </div>
          <div>
            <Label>E-posta</Label>
            <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </div>
          <div>
            <Label>Şifre</Label>
            <Input
              type="password"
              value={form.password}
              placeholder={editingUserId ? "Aynı kalacaksa boş bırakın" : "Şifre girin"}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          </div>
          <div>
            <Label>Rol</Label>
            <Select
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  role: event.target.value as Role,
                  departmentId: event.target.value === "SHIFT_SUPERVISOR" ? current.departmentId : "",
                  machineIds: event.target.value === "OPERATOR" ? current.machineIds : []
                }))
              }
            >
              <option value="ADMIN">ADMIN</option>
              <option value="FACTORY_MANAGER">FACTORY_MANAGER</option>
              <option value="SHIFT_SUPERVISOR">SHIFT_SUPERVISOR</option>
              <option value="OPERATOR">OPERATOR</option>
            </Select>
          </div>
          {form.role === "SHIFT_SUPERVISOR" ? (
            <div className="xl:col-span-2">
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
          ) : null}
          {form.role === "OPERATOR" ? (
            <div className="md:col-span-2 xl:col-span-4">
              <Label>Makine Atamaları</Label>
              <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {visibleMachines.map((machine) => (
                  <label key={machine.id} className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.machineIds.includes(machine.id)}
                      onChange={() => toggleMachine(machine.id)}
                    />
                    <span>{machine.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex items-end gap-2">
            <Button onClick={saveUser}>{editingUserId ? "Güncelle" : "Kaydet"}</Button>
            {editingUserId ? <Button variant="outline" onClick={resetForm}>Vazgeç</Button> : null}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Listesi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4">
              <div>
                <p className="font-semibold text-slate-900">{user.fullName}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {user.departmentName ?? "Bölüm yok"}
                  {user.assignedMachineIds.length ? ` • Makineler: ${user.assignedMachineIds.join(", ")}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <RoleBadge role={user.role} />
                <button className="text-sm font-medium text-slate-700" onClick={() => startEdit(user)}>
                  Düzenle
                </button>
                <button className="text-sm font-medium text-red-700" onClick={() => void removeUser(user.id)}>
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
