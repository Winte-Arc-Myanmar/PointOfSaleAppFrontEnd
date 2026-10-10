import { redirect } from "next/navigation";

/** Merged into /roles: each role's permissions are set on the role. */
export default function AssignPermissionsPage() {
  redirect("/roles");
}
