export interface Shift {
  id: number;
  name: string;
  supervisorId?: number | null;
  supervisorName?: string | null;
  startTime: string;
  endTime?: string | null;
  isActive: boolean;
  createdAt: string;
}

