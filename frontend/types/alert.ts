export type AlertType = "HIGH_WASTE_RATE" | "LONG_FAULT_DURATION" | "LONG_STOP_DURATION";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface Alert {
  id: number;
  alertType: AlertType;
  severity: AlertSeverity;
  machineId?: number | null;
  machineName?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  materialId?: number | null;
  materialTrackingCode?: string | null;
  message: string;
  thresholdValue?: number | null;
  actualValue?: number | null;
  isRead: boolean;
  createdAt: string;
}

