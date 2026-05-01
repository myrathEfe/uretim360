import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="overflow-hidden bg-gradient-to-r from-ink via-steel to-amber-800 text-white">
      <CardContent className="flex flex-col gap-4 px-6 py-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/70">MES-Lite</p>
          <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80">{description}</p>
        </div>
        {action ? <div>{action}</div> : null}
      </CardContent>
    </Card>
  );
}
