"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";
import { Shield, KeyRound } from "lucide-react";
import { useRole, useRoles, useSetRolePermissions } from "@/presentation/hooks/useRoles";
import { usePermissionCatalog } from "@/presentation/hooks/usePermissionCatalog";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useGrantablePermissions } from "@/presentation/hooks/useGrantablePermissions";
import { getHttpErrorMessage } from "@/lib/http-error";
import { RolePermissionGrid } from "./RolePermissionGrid";

const sameSet = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every((id) => b.has(id));

export function RoleDetail({ roleId }: { roleId: string }) {
  const toast = useToast();
  const { data: role, isLoading, error } = useRole(roleId);
  const { data: permissionsData, isLoading: isPermLoading } = usePermissionCatalog();
  const isGrantable = useGrantablePermissions(role?.tenantId);
  const permissions = useMemo(
    () => (isGrantable ? getPaginatedItems(permissionsData).filter(isGrantable) : []),
    [isGrantable, permissionsData],
  );
  const save = useSetRolePermissions();
  const { data: rolesData } = useRoles();
  const parentName = role?.parentId
    ? getPaginatedItems(rolesData).find((r) => r.id === role.parentId)?.name
    : undefined;

  const held = useMemo(() => new Set(role?.permissionIds ?? []), [role?.permissionIds]);
  const [edits, setEdits] = useState<Set<string> | null>(null);
  const selected = edits ?? held;
  const changed = edits !== null && !sameSet(edits, held);

  const overviewRows = role
    ? [
        { label: "Role ID", value: safeText(role.id), mono: true },
        { label: "Name", value: safeText(role.name) },
        { label: "Tenant ID", value: safeText(role.tenantId), mono: true },
        { label: "Parent role", value: safeText(parentName) },
        { label: "Parent ID", value: safeText(role.parentId), mono: true },
        { label: "System default", value: role.isSystemDefault ? "Yes" : "No" },
      ]
    : [];

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading role..." />;
  if (error || !role)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Role not found or failed to load.</p>
        <Link href="/roles">
          <Button variant="outline">Back to Roles</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/roles"
        backLabel="Roles"
        title={safeText(role.name)}
        editHref={`/roles/${role.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Shield}>
          <DetailRows rows={overviewRows} />
        </DetailSection>

        <DetailSection title="Permissions" icon={KeyRound} className="lg:col-span-2">
          {isPermLoading || !isGrantable ? (
            <div className="panel flex min-h-48 items-center justify-center rounded-xl bg-background/80">
              <AppLoader fullScreen={false} showName={false} size="sm" message="Loading permissions..." />
            </div>
          ) : (
            <div className="space-y-4">
              <RolePermissionGrid permissions={permissions} selected={selected} onChange={setEdits} />
              {changed ? (
                <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mint/50 bg-background/95 px-5 py-3 shadow-lg backdrop-blur">
                  <span className="text-sm font-medium">Unsaved permission changes</span>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setEdits(null)} disabled={save.isPending}>
                      Discard
                    </Button>
                    <Button
                      type="button"
                      disabled={save.isPending}
                      onClick={() =>
                        save.mutate(
                          { roleId: role.id, permissionIds: Array.from(selected) },
                          {
                            onSuccess: () => {
                              setEdits(null);
                              toast.success("Permissions saved.");
                            },
                            onError: (err) =>
                              toast.error(getHttpErrorMessage(err, "Failed to save permissions.")),
                          },
                        )
                      }
                    >
                      {save.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </DetailSection>
      </div>
    </div>
  );
}

