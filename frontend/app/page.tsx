import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { defaultRouteByRole } from "@/lib/utils";

export default async function HomePage() {
  const session = await auth();
  redirect(session?.user ? defaultRouteByRole(session.user.role) : "/login");
}

