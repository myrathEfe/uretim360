"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { Boxes, Bell, Factory, Gauge, Layers3, Package, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/user";

interface MenuItem {
  href: string;
  label: string;
  roles: Role[];
  icon: ComponentType<{ className?: string }>;
}

const items: MenuItem[] = [
  { href: "/dashboard", label: "Gösterge Paneli", roles: ["ADMIN", "FACTORY_MANAGER", "SHIFT_SUPERVISOR"], icon: Gauge },
  { href: "/makineler", label: "Makineler", roles: ["ADMIN", "FACTORY_MANAGER", "SHIFT_SUPERVISOR", "OPERATOR"], icon: Factory },
  { href: "/bolumler", label: "Bölümler", roles: ["ADMIN", "FACTORY_MANAGER", "SHIFT_SUPERVISOR"], icon: Layers3 },
  { href: "/malzemeler", label: "Malzemeler", roles: ["ADMIN", "FACTORY_MANAGER", "SHIFT_SUPERVISOR"], icon: Package },
  { href: "/uretim-kayitlari", label: "Üretim Kayıtları", roles: ["ADMIN", "FACTORY_MANAGER", "SHIFT_SUPERVISOR", "OPERATOR"], icon: Boxes },
  { href: "/vardiyalar", label: "Vardiyalar", roles: ["ADMIN", "FACTORY_MANAGER", "SHIFT_SUPERVISOR", "OPERATOR"], icon: ShieldCheck },
  { href: "/uyarilar", label: "Uyarılar", roles: ["ADMIN", "FACTORY_MANAGER", "SHIFT_SUPERVISOR"], icon: Bell },
  { href: "/kullanicilar", label: "Kullanıcılar", roles: ["ADMIN"], icon: Users }
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 flex-col border-r border-white/30 bg-ink px-5 py-6 text-white lg:flex">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-amber-300">MES-Lite</p>
        <h2 className="mt-3 text-2xl font-semibold">Üretim Nabzı</h2>
        <p className="mt-2 text-sm text-slate-300">Tekstil üretim akışını bölüm, makine ve malzeme bazında görün.</p>
      </div>
      <nav className="mt-10 space-y-2">
        {items
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                  active ? "bg-white text-ink shadow-lg" : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
