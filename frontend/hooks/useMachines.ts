"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/axios";
import type { Machine, MachineGridItem, MachineStatusLog } from "@/types/machine";

export function useMachines(accessToken?: string, useScopedGrid = false) {
  const [machines, setMachines] = useState<Machine[] | MachineGridItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const load = async () => {
      try {
        const data = useScopedGrid
          ? await apiGet<MachineGridItem[]>("/api/dashboard/machine-status", accessToken)
          : await apiGet<Machine[]>("/api/machines", accessToken);
        setMachines(data);
      } catch {
        setError("Makine verileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [accessToken, useScopedGrid]);

  return { machines, loading, error };
}

export function useMachineDetail(id: string, accessToken?: string) {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [logs, setLogs] = useState<MachineStatusLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const load = async () => {
      const [machineData, logData] = await Promise.all([
        apiGet<Machine>(`/api/machines/${id}`, accessToken),
        apiGet<MachineStatusLog[]>(`/api/machines/${id}/status-logs`, accessToken).catch(() => [])
      ]);
      setMachine(machineData);
      setLogs(logData);
      setLoading(false);
    };

    void load();
  }, [accessToken, id]);

  return { machine, logs, loading };
}

