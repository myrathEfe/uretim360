"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/axios";
import type { Material, MaterialHistory } from "@/types/material";

export function useMaterials(accessToken?: string, enabled = true) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!accessToken || !enabled) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const data = await apiGet<Material[]>("/api/materials", accessToken);
      setMaterials(data);
      setLoading(false);
    };

    void load();
  }, [accessToken, enabled]);

  return { materials, loading };
}

export function useMaterialDetail(id: string, accessToken?: string) {
  const [material, setMaterial] = useState<Material | null>(null);
  const [history, setHistory] = useState<MaterialHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const load = async () => {
      const [materialData, historyData] = await Promise.all([
        apiGet<Material>(`/api/materials/${id}`, accessToken),
        apiGet<MaterialHistory[]>(`/api/materials/${id}/history`, accessToken)
      ]);
      setMaterial(materialData);
      setHistory(historyData);
      setLoading(false);
    };

    void load();
  }, [accessToken, id]);

  return { material, history, loading };
}

