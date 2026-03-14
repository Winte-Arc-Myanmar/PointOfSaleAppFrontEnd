/**
 * Users page - system_admin only. Middleware redirects others to /products.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { UserList } from "@/features/users/presentation/UserList";

export default function UsersPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <p className="text-matte-white/70">
          Manage users. Only system administrators can access this section.
        </p>
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-matte-white/60">
            Users
          </h2>
          <UserList />
        </section>
      </div>
    </Shell>
  );
}
