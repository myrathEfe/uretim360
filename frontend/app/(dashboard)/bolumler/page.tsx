"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet, apiPost } from "@/lib/axios";
import type { Department } from "@/types/department";

export default function DepartmentsPage() {
  const { data: session } = useSession();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!session?.user.accessToken) {
        return;
      }
      const data = await apiGet<Department[]>("/api/departments", session.user.accessToken);
      setDepartments(data);
    };
    void load();
  }, [session?.user.accessToken]);

  const createDepartment = async () => {
    if (!session?.user.accessToken || !name) {
      return;
    }
    await apiPost("/api/departments", { name, sectorType: "TEXTILE", displayOrder: departments.length + 1, isActive: true }, session.user.accessToken);
    const data = await apiGet<Department[]>("/api/departments", session.user.accessToken);
    setDepartments(data);
    setName("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bölümler"
        description="Tekstil üretim hattındaki departmanların sırası, kapsamı ve makine dağılımı."
        action={session?.user.role === "ADMIN" ? <Button onClick={createDepartment}>Bölüm Ekle</Button> : null}
      />
      {session?.user.role === "ADMIN" ? (
        <Card>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <Label>Yeni Bölüm Adı</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Örn. Kalite Kontrol" />
            </div>
            <Button onClick={createDepartment}>Kaydet</Button>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {departments.map((department) => (
          <Card key={department.id}>
            <CardHeader>
              <CardTitle>{department.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Sıra: {department.displayOrder}</p>
              <p className="mt-1 text-sm text-slate-500">Sektör: {department.sectorType}</p>
              <Link href={`/bolumler/${department.id}`} className="mt-4 inline-flex text-sm font-medium text-amber-700">
                Makineleri Gör
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

