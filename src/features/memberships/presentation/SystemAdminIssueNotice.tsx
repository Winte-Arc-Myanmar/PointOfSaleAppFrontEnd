"use client";

import { usePermissions } from "@/presentation/hooks/usePermissions";

export function SystemAdminIssueNotice() {
  const { isSystemAdmin } = usePermissions();
  if (!isSystemAdmin) return null;
  return (
    <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
      You are signed in as a system admin. System admins can view guest cards and
      wallets but cannot issue or change them. Sign in as a user of the organization
      to do that.
    </p>
  );
}
