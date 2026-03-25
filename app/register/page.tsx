/**
 * Registration is only available to System Admins at /admin/create-user.
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
    redirect("/admin/create-user");
  }
  redirect("/products");
}
