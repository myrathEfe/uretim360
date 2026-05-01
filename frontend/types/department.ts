export interface Department {
  id: number;
  name: string;
  sectorType: "TEXTILE" | "FOOD" | "METAL" | "PLASTIC";
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

