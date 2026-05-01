"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductionTrendItem } from "@/types/dashboard";

export function ProductionTrendChart({ data }: { data: ProductionTrendItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>7 Günlük Üretim ve Fire Trendi</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="prod" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#264653" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#264653" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="waste" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="production" stroke="#264653" fill="url(#prod)" />
            <Area type="monotone" dataKey="waste" stroke="#d97706" fill="url(#waste)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

