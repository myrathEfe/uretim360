export type MaterialType = "RAW_MATERIAL" | "SEMI_PRODUCT" | "FINISHED_PRODUCT";

export interface Material {
  id: number;
  trackingCode: string;
  name: string;
  materialType: MaterialType;
  currentMachineId?: number | null;
  currentMachineName?: string | null;
  currentDepartmentId?: number | null;
  currentDepartmentName?: string | null;
  totalInputQty: number;
  totalOutputQty: number;
  totalWasteQty: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialHistory {
  id: number;
  machineId?: number | null;
  machineName?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  enteredAt: string;
  leftAt?: string | null;
  productionRecordId?: number | null;
}

