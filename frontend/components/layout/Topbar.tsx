"use client";

import { signOut, useSession } from "next-auth/react";
import { Bell, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/common/RoleBadge";
import { apiGet } from "@/lib/axios";
import type { Role } from "@/types/user";

export function Topbar() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      if (!session?.user.accessToken) {
        return;
      }

      try {
        const data = await apiGet<{ count: number }>("/api/alerts/unread-count", session.user.accessToken);
        setUnreadCount(data.count);
      } catch {
        setUnreadCount(0);
      }
    };

    void load();
  }, [session?.user.accessToken]);

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white/80 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-sm font-medium text-slate-500">Canlı üretim görünümü</p>
        <h1 className="text-xl font-semibold text-slate-900">Hoş geldiniz, {session?.user.name}</h1>
      </div>
      <div className="flex items-center gap-3">
        {session?.user.role ? <RoleBadge role={session.user.role as Role} /> : null}
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900">
          <Bell className="h-4 w-4" />
          {unreadCount} okunmamış uyarı
        </div>
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="mr-2 h-4 w-4" />
          Çıkış
        </Button>
      </div>
    </div>
  );
}
