import { Shell } from "@/presentation/components/layout/Shell";
import { SystemAdminCreateUserForm } from "@/features/system-admin/presentation/SystemAdminCreateUserForm";

export default function CreateUserPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Create a user with explicit tenant, branch, and role context.
        </p>
        <SystemAdminCreateUserForm />
      </div>
    </Shell>
  );
}
