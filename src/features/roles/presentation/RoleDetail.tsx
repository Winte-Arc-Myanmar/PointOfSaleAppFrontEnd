"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";
import { Shield, KeyRound, ListChecks, Search } from "lucide-react";
import { useRole, useAssignRolePermissions } from "@/presentation/hooks/useRoles";
import { usePermissionCatalog } from "@/presentation/hooks/usePermissionCatalog";

function permissionLabel(p: { module: string; subject: string; action: string }) {
  return `${p.module}:${p.subject}:${p.action}`.toLowerCase();
}

export function RoleDetail({ roleId }: { roleId: string }) {
  const toast = useToast();
  const { data: role, isLoading, error } = useRole(roleId);
  const { data: permissions = [], isLoading: isPermLoading } = usePermissionCatalog();
  const assign = useAssignRolePermissions();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const overviewRows = role
    ? [
        { label: "Role ID", value: safeText(role.id), mono: true },
        { label: "Name", value: safeText(role.name) },
        { label: "Tenant ID", value: safeText(role.tenantId), mono: true },
        { label: "Parent ID", value: safeText(role.parentId), mono: true },
        { label: "System default", value: role.isSystemDefault ? "Yes" : "No" },
      ]
    : [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter((p) => {
      const hay = `${p.module} ${p.subject} ${p.action} ${p.description} ${permissionLabel(p)}`.toLowerCase();
      return hay.includes(q);
    });
  }, [permissions, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, typeof filtered>>();
    for (const p of filtered) {
      const mod = p.module || "OTHER";
      const subj = p.subject || "GENERAL";
      if (!map.has(mod)) map.set(mod, new Map());
      const subMap = map.get(mod)!;
      if (!subMap.has(subj)) subMap.set(subj, []);
      subMap.get(subj)!.push(p);
    }
    // stable sort
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([module, subjects]) => ({
        module,
        subjects: Array.from(subjects.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([subject, perms]) => ({
            subject,
            perms: perms.slice().sort((x, y) =>
              `${x.action}${x.description}`.localeCompare(`${y.action}${y.description}`)
            ),
          })),
      }));
  }, [filtered]);

  const selectedCount = selected.size;

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

        <DetailSection title="Assign permissions" icon={KeyRound} className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search permissions (module, subject, action, description)"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSelected(new Set())}
                  disabled={selectedCount === 0}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    assign.mutate(
                      { roleId: role.id, permissionIds: Array.from(selected) },
                      {
                        onSuccess: () => toast.success("Permissions assigned."),
                        onError: () => toast.error("Failed to assign permissions."),
                      }
                    );
                  }}
                  disabled={assign.isPending || selectedCount === 0}
                >
                  {assign.isPending ? "Assigning..." : `Assign (${selectedCount})`}
                </Button>
              </div>
            </div>

            {isPermLoading ? (
              <div className="panel flex items-center justify-center min-h-48 rounded-xl bg-background/80">
                <AppLoader fullScreen={false} showName={false} size="sm" message="Loading permissions..." />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {grouped.map((g) => {
                  const flat = g.subjects.flatMap((s) => s.perms);
                  const allSelected = flat.length > 0 && flat.every((p) => selected.has(p.id));
                  const anySelected = flat.some((p) => selected.has(p.id));
                  return (
                    <div key={g.module} className="rounded-xl border border-border bg-background/60 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <ListChecks className="size-4 text-mint" />
                          <p className="font-semibold text-foreground tracking-tight">{g.module}</p>
                          <span className="text-xs text-muted">({flat.length})</span>
                        </div>
                        <button
                          type="button"
                          className="text-xs font-medium text-mint hover:underline"
                          onClick={() => {
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (allSelected) flat.forEach((p) => next.delete(p.id));
                              else flat.forEach((p) => next.add(p.id));
                              return next;
                            });
                          }}
                        >
                          {allSelected ? "Unselect all" : anySelected ? "Select all" : "Select all"}
                        </button>
                      </div>

                      <div className="mt-3 space-y-3">
                        {g.subjects.map((s) => (
                          <div key={s.subject}>
                            <p className="text-xs font-medium text-muted uppercase tracking-wider">
                              {s.subject}
                            </p>
                            <ul className="mt-2 space-y-2">
                              {s.perms.map((p) => {
                                const checked = selected.has(p.id);
                                return (
                                  <li key={p.id} className="flex gap-3 rounded-lg border border-border/60 bg-background px-3 py-2">
                                    <input
                                      type="checkbox"
                                      className="mt-0.5 h-4 w-4 accent-emerald-500"
                                      checked={checked}
                                      onChange={() => {
                                        setSelected((prev) => {
                                          const next = new Set(prev);
                                          if (next.has(p.id)) next.delete(p.id);
                                          else next.add(p.id);
                                          return next;
                                        });
                                      }}
                                    />
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-foreground">
                                        {p.action}
                                        <span className="ml-2 text-xs text-muted font-mono">
                                          {permissionLabel(p)}
                                        </span>
                                      </p>
                                      <p className="text-xs text-muted wrap-break-word">{p.description}</p>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DetailSection>
      </div>
    </div>
  );
}

