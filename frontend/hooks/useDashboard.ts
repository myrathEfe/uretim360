"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/axios";
import type { Alert } from "@/types/alert";
import type {
  DashboardSummary,
  DepartmentStatItem,
  ProductionTrendItem
} from "@/types/dashboard";
import type { MachineGridItem } from "@/types/machine";

export function useDashboard(accessToken?: string) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<ProductionTrendItem[]>([]);
  const [machineGrid, setMachineGrid] = useState<MachineGridItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const load = async () => {
      try {
        const [summaryData, trendData, machineData, alertsData, departmentData] = await Promise.all([
          apiGet<DashboardSummary>("/api/dashboard/summary", accessToken),
          apiGet<ProductionTrendItem[]>("/api/dashboard/production-trend?days=7", accessToken),
          apiGet<MachineGridItem[]>("/api/dashboard/machine-status", accessToken),
          apiGet<Alert[]>("/api/alerts", accessToken).catch(() => []),
          apiGet<DepartmentStatItem[]>("/api/dashboard/department-stats", accessToken).catch(() => [])
        ]);

        setSummary(summaryData);
        setTrend(trendData);
        setMachineGrid(machineData);
        setAlerts(alertsData);
        setDepartmentStats(departmentData);
      } catch (caughtError) {
        setError("Gösterge paneli verileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [accessToken]);

  return { summary, trend, machineGrid, alerts, departmentStats, loading, error };
}

export function useScopedDashboard(accessToken?: string) {
  const [machineGrid, setMachineGrid] = useState<MachineGridItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const load = async () => {
      const [machineData, alertsData] = await Promise.all([
        apiGet<MachineGridItem[]>("/api/dashboard/machine-status", accessToken),
        apiGet<Alert[]>("/api/alerts", accessToken).catch(() => [])
      ]);
      setMachineGrid(machineData);
      setAlerts(alertsData);
      setLoading(false);
    };

    void load();
  }, [accessToken]);

  return { machineGrid, alerts, loading };
}
