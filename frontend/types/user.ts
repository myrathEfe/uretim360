export type Role = "ADMIN" | "FACTORY_MANAGER" | "SHIFT_SUPERVISOR" | "OPERATOR";

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  departmentId?: number | null;
  departmentName?: string | null;
  isActive: boolean;
  assignedMachineIds: number[];
  createdAt: string;
  updatedAt: string;
}

