/**
 * Registration is only available to System Admins at /admin/register.
 * This page redirects accordingly.
 */

import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export default async function RegisterPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userType = (session.user as { type?: string }).type;
  if (userType === "systemAdmin") {
    redirect("/admin/register");
  }
  redirect("/products");
}
