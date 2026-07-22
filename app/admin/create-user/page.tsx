import { Shell } from "@/presentation/components/layout/Shell";
import { SystemAdminCreateUserForm } from "@/features/system-admin/presentation/SystemAdminCreateUserForm";

export default function CreateUserPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage users.</p>
        <SystemAdminCreateUserForm />
      </div>
    </Shell>
  );
}
