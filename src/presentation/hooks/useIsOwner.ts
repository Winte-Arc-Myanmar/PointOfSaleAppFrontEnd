"use client";

import { useSession } from "next-auth/react";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useUser } from "@/presentation/hooks/useUsers";

/** Whether the signed-in person may change Owners: an Owner, or a system admin. */
export function useIsOwner(): boolean {
  const { data: session } = useSession();
  const { isSystemAdmin } = usePermissions();
  const { data: me } = useUser(isSystemAdmin ? null : session?.user?.id ?? null);
  return isSystemAdmin || Boolean(me?.isOwner);
}
