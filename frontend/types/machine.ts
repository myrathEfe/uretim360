export type MachineStatus = "RUNNING" | "STOPPED" | "MAINTENANCE" | "FAULT";

export interface Machine {
  id: number;
  departmentId: number;
  departmentName: string;
  name: string;
  serialNumber?: string | null;
  status: MachineStatus;
  statusSince: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MachineStatusLog {
  id: number;
  oldStatus?: MachineStatus | null;
  newStatus: MachineStatus;
  changedByUserId: number;
  changedByName: string;
  note?: string | null;
  startedAt: string;
  endedAt?: string | null;
}

export interface MachineGridItem {
  machineId: number;
  machineName: string;
  departmentName: string;
  status: MachineStatus;
  statusSince: string;
  materialTrackingCode?: string | null;
}

