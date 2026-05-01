"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiPatch } from "@/lib/axios";
import type { MachineStatus } from "@/types/machine";

const actions: { label: string; status: MachineStatus }[] = [
  { label: "Çalışıyor", status: "RUNNING" },
  { label: "Durdu", status: "STOPPED" },
  { label: "Bakım", status: "MAINTENANCE" },
  { label: "Arıza Başladı", status: "FAULT" }
];

export function MachineStatusActions({
  machineId,
  accessToken,
  onDone
}: {
  machineId: number;
  accessToken: string;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpdate = async (status: MachineStatus) => {
    setLoading(status);
    await apiPatch(`/api/machines/${machineId}/status`, { newStatus: status, note: "Panel üzerinden güncellendi." }, accessToken);
    setLoading(null);
    onDone?.();
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          variant={action.status === "FAULT" ? "destructive" : "secondary"}
          disabled={loading !== null}
          onClick={() => handleUpdate(action.status)}
        >
          {loading === action.status ? "Güncelleniyor..." : action.label}
        </Button>
      ))}
    </div>
  );
}

