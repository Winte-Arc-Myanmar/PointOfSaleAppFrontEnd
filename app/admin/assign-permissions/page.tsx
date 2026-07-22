import { Shell } from "@/presentation/components/layout/Shell";
import { AssignPermissionsForm } from "@/features/system-admin/presentation/AssignPermissionsForm";

export default function AssignPermissionsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">Manage role permissions.</p>
        <AssignPermissionsForm />
      </div>
    </Shell>
  );
}
