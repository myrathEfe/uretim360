"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleBadge } from "@/components/common/RoleBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { apiGet, apiPost } from "@/lib/axios";
import type { User } from "@/types/user";

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [fullName, setFullName] = useState("Yeni Kullanıcı");
  const [email, setEmail] = useState("new.user@meslite.com");
  const [role, setRole] = useState("OPERATOR");

  const load = async () => {
    if (!session?.user.accessToken) {
      return;
    }
    const data = await apiGet<User[]>("/api/users", session.user.accessToken);
    setUsers(data);
  };

  useEffect(() => {
    if (session?.user.role === "ADMIN") {
      void load();
    }
  }, [session?.user.accessToken, session?.user.role]);

  const createUser = async () => {
    if (!session?.user.accessToken) {
      return;
    }
    await apiPost(
      "/api/users",
      {
        email,
        fullName,
        password: "Test1234!",
        role,
        isActive: true,
        departmentId: role === "SHIFT_SUPERVISOR" ? 1 : null,
        machineIds: role === "OPERATOR" ? [1] : []
      },
      session.user.accessToken
    );
    await load();
  };

  if (session?.user.role !== "ADMIN") {
    return <Card><CardContent>Bu sayfa yalnızca sistem yöneticilerine açıktır.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Kullanıcılar" description="Rol ataması, aktivasyon ve operatör yetkilendirmeleri bu modülden yönetilir." />
      <Card>
        <CardHeader>
          <CardTitle>Yeni Kullanıcı Oluştur</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <Label>Ad Soyad</Label>
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </div>
          <div>
            <Label>E-posta</Label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div>
            <Label>Rol</Label>
            <Select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="ADMIN">ADMIN</option>
              <option value="FACTORY_MANAGER">FACTORY_MANAGER</option>
              <option value="SHIFT_SUPERVISOR">SHIFT_SUPERVISOR</option>
              <option value="OPERATOR">OPERATOR</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={createUser}>Kaydet</Button>
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
              </div>
              <RoleBadge role={user.role} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
