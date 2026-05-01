"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMaterialDetail } from "@/hooks/useMaterials";
import { formatDate, formatNumber } from "@/lib/utils";

export default function MaterialDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: session } = useSession();
  const { material, history, loading } = useMaterialDetail(params.id, session?.user.accessToken);

  if (loading || !material) {
    return <p className="text-sm text-slate-600">Malzeme detayları yükleniyor...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={material.trackingCode} description={`${material.name} için pozisyon ve stage geçmişi.`} />
      <Card>
        <CardHeader>
          <CardTitle>Malzeme Özeti</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <p>Tip: {material.materialType}</p>
          <p>Bölüm: {material.currentDepartmentName ?? "Tanımsız"}</p>
          <p>Toplam Girdi: {formatNumber(material.totalInputQty)} ton</p>
          <p>Toplam Çıktı: {formatNumber(material.totalOutputQty)} ton</p>
          <p>Toplam Fire: {formatNumber(material.totalWasteQty)} ton</p>
          <p>Makine: {material.currentMachineName ?? "Tanımsız"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Stage Geçmişi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
              <p className="font-medium text-slate-900">{item.departmentName ?? "Bölüm yok"} / {item.machineName ?? "Makine yok"}</p>
              <p className="mt-2 text-sm text-slate-500">Giriş: {formatDate(item.enteredAt)}</p>
              <p className="text-sm text-slate-500">Çıkış: {item.leftAt ? formatDate(item.leftAt) : "Aktif"}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

