/**
 * Users page - system_admin only. Middleware redirects others to /products.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { UserList } from "@/features/users/presentation/UserList";

export default function UsersPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="page-description">
          Manage users. Only system administrators can access this section.
        </p>
        <section>
          <h2 className="section-label mb-4">
            Users
          </h2>
          <UserList />
        </section>
      </div>
    </Shell>
  );
}
