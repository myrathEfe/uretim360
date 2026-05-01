export interface ProductionRecord {
  id: number;
  materialId: number;
  materialTrackingCode: string;
  machineId: number;
  machineName: string;
  departmentId: number;
  departmentName: string;
  shiftId?: number | null;
  shiftName?: string | null;
  recordedByUserId: number;
  recordedByName: string;
  inputQty: number;
  outputQty: number;
  wasteQty: number;
  wasteRate: number;
  notes?: string | null;
  recordedAt: string;
}

