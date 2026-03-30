import { Shell } from "@/presentation/components/layout/Shell";
import { RoleList } from "@/features/roles/presentation/RoleList";

export default function RolesPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Manage roles and assign permissions for your tenant.
        </p>
        <section>
          <h2 className="section-label mb-4">Roles</h2>
          <RoleList />
        </section>
      </div>
    </Shell>
  );
}

