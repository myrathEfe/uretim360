import type { MachineStatus } from "@/types/machine";

export interface SummaryCard {
  totalProduction: number;
  totalWaste: number;
  averageWasteRate: number;
  faultyMachineCount: number;
}

export interface MachineStatusDistributionItem {
  status: MachineStatus;
  count: number;
}

export interface ProductionTrendItem {
  date: string;
  production: number;
  waste: number;
}

export interface DepartmentStatItem {
  departmentId: number;
  departmentName: string;
  totalProduction: number;
  totalWaste: number;
  wasteRate: number;
}

export interface WasteMachineItem {
  machineId: number;
  machineName: string;
  departmentName: string;
  wasteRate: number;
  trend: "up" | "down" | "flat" | string;
}

export interface DashboardSummary {
  summary: SummaryCard;
  machineStatusCounts: MachineStatusDistributionItem[];
  topWasteMachines: WasteMachineItem[];
  departmentBreakdown: DepartmentStatItem[];
}

