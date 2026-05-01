"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet, apiPost } from "@/lib/axios";
import { useMaterials } from "@/hooks/useMaterials";
import type { Material } from "@/types/material";

export default function MaterialsPage() {
  const { data: session } = useSession();
  const canList = session?.user.role === "ADMIN" || session?.user.role === "FACTORY_MANAGER";
  const canCreate = session?.user.role === "ADMIN" || session?.user.role === "SHIFT_SUPERVISOR";
  const { materials } = useMaterials(session?.user.accessToken, canList);
  const [trackingCode, setTrackingCode] = useState("");
  const [foundMaterial, setFoundMaterial] = useState<Material | null>(null);
  const [newName, setNewName] = useState("");
  const [currentDepartmentId, setCurrentDepartmentId] = useState(1);

  const lookup = async () => {
    if (!session?.user.accessToken || !trackingCode) {
      return;
    }
    const data = await apiGet<Material>(`/api/materials/tracking/${trackingCode}`, session.user.accessToken);
    setFoundMaterial(data);
  };

  const createMaterial = async () => {
    if (!session?.user.accessToken || !newName) {
      return;
    }
    let departmentId = currentDepartmentId;
    if (session.user.role === "SHIFT_SUPERVISOR") {
      const currentUser = await apiGet<{ departmentId?: number | null }>("/api/auth/me", session.user.accessToken);
      departmentId = currentUser.departmentId ?? 1;
      setCurrentDepartmentId(departmentId);
    }
    await apiPost(
      "/api/materials",
      { name: newName, materialType: "RAW_MATERIAL", currentDepartmentId: departmentId },
      session.user.accessToken
    );
    setNewName("");
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
          <Button onClick={lookup}>Sorgula</Button>
          {foundMaterial ? (
            <div className="md:col-span-2 rounded-2xl bg-slate-50 p-4">
              <Link href={`/malzemeler/${foundMaterial.id}`} className="font-medium text-amber-700">
                {foundMaterial.trackingCode} - {foundMaterial.name}
              </Link>
            </div>
          ) : null}
        </CardContent>
      </Card>
      {canCreate ? (
        <Card>
          <CardHeader>
            <CardTitle>Yeni Malzeme</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <Label>Malzeme Adı</Label>
              <Input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Yeni lot adı" />
            </div>
            <Button onClick={createMaterial}>Oluştur</Button>
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
                <Link href={`/malzemeler/${material.id}`} className="text-sm font-medium text-amber-700">
                  Geçmişi Gör
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
