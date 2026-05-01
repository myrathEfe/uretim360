import { Badge } from "@/components/ui/badge";
import { roleLabel } from "@/lib/utils";
import type { Role } from "@/types/user";

export function RoleBadge({ role }: { role: Role }) {
  const tone = role === "ADMIN" ? "danger" : role === "FACTORY_MANAGER" ? "warning" : role === "SHIFT_SUPERVISOR" ? "default" : "success";
  return <Badge tone={tone}>{roleLabel(role)}</Badge>;
}

