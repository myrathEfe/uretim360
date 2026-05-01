"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusLabel } from "@/lib/utils";
import type { MachineStatusDistributionItem } from "@/types/dashboard";

const colors = ["#264653", "#64748b", "#d97706", "#dc2626"];

export function MachineStatusChart({ data }: { data: MachineStatusDistributionItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Makine Durum Dağılımı</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" outerRadius={110} label={(entry) => statusLabel(entry.status)}>
              {data.map((item, index) => (
                <Cell key={item.status} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, statusLabel(String(name))]} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

