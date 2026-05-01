import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { auth } from "@/lib/auth";
import type { Role } from "@/types/user";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar role={session.user.role as Role} />
      <div className="flex-1">
        <Topbar />
        <main className="space-y-6 p-6">{children}</main>
      </div>
    </div>
  );
}
