"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/presentation/components/ui/input";
import type { Permission } from "@/core/domain/entities/Permission";

const COLUMNS = [
  { action: "read", label: "View" },
  { action: "write", label: "Edit" },
  { action: "delete", label: "Delete" },
] as const;
const MAIN_ACTIONS = new Set<string>(COLUMNS.map((c) => c.action));

const UPPER = new Set(["pos", "kds", "uom", "grn", "ktv", "spa", "gl", "id", "vip"]);

/** "accounting-period" → "Accounting period"; "pos" → "POS". */
export function humanize(code: string): string {
  const words = code.split(/[-_:\s]+/).filter(Boolean);
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (UPPER.has(lower)) return lower.toUpperCase();
      return index === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
    })
    .join(" ");
}

type Area = {
  key: string;
  label: string;
  byAction: Map<string, Permission>;
  others: Permission[];
};

type Group = { module: string; label: string; areas: Area[]; ids: string[] };

function groupPermissions(permissions: Permission[]): Group[] {
  const modules = new Map<string, Map<string, Area>>();
  for (const permission of permissions) {
    const moduleCode = permission.module || "other";
    const subject = permission.subject || "general";
    if (!modules.has(moduleCode)) modules.set(moduleCode, new Map());
    const areas = modules.get(moduleCode)!;
    if (!areas.has(subject)) {
      areas.set(subject, { key: `${moduleCode}:${subject}`, label: humanize(subject), byAction: new Map(), others: [] });
    }
    const area = areas.get(subject)!;
    const action = permission.action.toLowerCase();
    if (MAIN_ACTIONS.has(action)) area.byAction.set(action, permission);
    else area.others.push(permission);
  }
  return Array.from(modules.entries())
    .map(([moduleCode, areas]) => {
      const list = Array.from(areas.values()).sort((a, b) => a.label.localeCompare(b.label));
      return {
        module: moduleCode,
        label: humanize(moduleCode),
        areas: list,
        ids: list.flatMap((area) => [...area.byAction.values(), ...area.others].map((p) => p.id)),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

function Tick({
  checked,
  partial,
  label,
  onChange,
}: {
  checked: boolean;
  partial?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      className="h-4 w-4 cursor-pointer accent-emerald-500"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = Boolean(partial) && !checked;
      }}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}

/**
 * A role's permissions as one row per area with View / Edit / Delete columns.
 * Giving Edit or Delete also gives View: neither works without seeing the list.
 */
export function RolePermissionGrid({
  permissions,
  selected,
  onChange,
}: {
  permissions: Permission[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => groupPermissions(permissions), [permissions]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        areas: group.module.includes(q) || group.label.toLowerCase().includes(q)
          ? group.areas
          : group.areas.filter((area) => area.label.toLowerCase().includes(q) || area.key.includes(q)),
      }))
      .filter((group) => group.areas.length > 0);
  }, [groups, query]);

  const allIds = useMemo(() => permissions.map((p) => p.id), [permissions]);
  const fullAccess = allIds.length > 0 && allIds.every((id) => selected.has(id));

  const set = (ids: string[], on: boolean) => {
    const next = new Set(selected);
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
    onChange(next);
  };

  const toggleCell = (area: Area, action: string, on: boolean) => {
    const permission = area.byAction.get(action);
    if (!permission) return;
    const ids = [permission.id];
    const view = area.byAction.get("read");
    if (on && action !== "read" && view) ids.push(view.id);
    if (!on && action === "read") {
      area.byAction.forEach((p) => ids.push(p.id));
      area.others.forEach((p) => ids.push(p.id));
    }
    set(ids, on);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find an area, e.g. Products"
            className="pl-9"
          />
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium">
          <button
            type="button"
            role="switch"
            aria-checked={fullAccess}
            onClick={() => set(allIds, !fullAccess)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
              fullAccess ? "bg-emerald-500" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                fullAccess ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
          Full access
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-muted/10 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Area</th>
              {COLUMNS.map((column) => (
                <th key={column.action} className="w-20 px-2 py-2 text-center font-medium">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-2 text-left font-medium">Other</th>
            </tr>
          </thead>
          {visible.map((group) => {
            const held = group.ids.filter((id) => selected.has(id)).length;
            return (
              <tbody key={group.module} className="border-t border-border">
                <tr className="bg-background/60">
                  <th colSpan={COLUMNS.length + 2} className="px-4 py-2 text-left">
                    <label className="flex cursor-pointer items-center gap-2 font-semibold text-foreground">
                      <Tick
                        label={`All of ${group.label}`}
                        checked={held === group.ids.length}
                        partial={held > 0}
                        onChange={(on) => set(group.ids, on)}
                      />
                      {group.label}
                      <span className="text-xs font-normal text-muted">
                        {held}/{group.ids.length}
                      </span>
                    </label>
                  </th>
                </tr>
                {group.areas.map((area) => (
                  <tr key={area.key} className="border-t border-border/50">
                    <td className="px-4 py-2 pl-10 text-foreground">{area.label}</td>
                    {COLUMNS.map((column) => {
                      const permission = area.byAction.get(column.action);
                      return (
                        <td key={column.action} className="px-2 py-2 text-center">
                          {permission ? (
                            <Tick
                              label={`${column.label} ${area.label}`}
                              checked={selected.has(permission.id)}
                              onChange={(on) => toggleCell(area, column.action, on)}
                            />
                          ) : (
                            <span className="text-muted/50">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-3">
                        {area.others.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground"
                            title={permission.description}
                          >
                            <Tick
                              label={`${humanize(permission.action)} ${area.label}`}
                              checked={selected.has(permission.id)}
                              onChange={(on) => set([permission.id], on)}
                            />
                            {humanize(permission.action)}
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            );
          })}
        </table>
        {visible.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted">No area matches “{query}”.</p>
        ) : null}
      </div>
    </div>
  );
}
