import { Shell } from "@/presentation/components/layout/Shell";
import { AssignRoleForm } from "@/features/system-admin/presentation/AssignRoleForm";

export default function AssignRolePage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Assign a role to a user at a specific branch.
        </p>
        <AssignRoleForm />
      </div>
    </Shell>
  );
}
