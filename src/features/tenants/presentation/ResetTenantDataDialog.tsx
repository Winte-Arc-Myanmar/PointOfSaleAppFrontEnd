"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/presentation/components/modal/Modal";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { AppLoader } from "@/presentation/components/loader";
import { useToast } from "@/presentation/providers/ToastProvider";
import { getHttpErrorMessage } from "@/lib/http-error";
import {
  useResetTenantData,
  useTenantResetPreview,
  type TenantResetPart,
} from "@/presentation/hooks/useTenantReset";

/** The chosen parts and every part they need, the way the server works it out. */
function withRequired(chosen: Set<string>, parts: TenantResetPart[]): Set<string> {
  const all = new Set<string>();
  const visit = (key: string) => {
    if (all.has(key)) return;
    all.add(key);
    parts.find((p) => p.key === key)?.requires.forEach(visit);
  };
  chosen.forEach(visit);
  return all;
}

/**
 * Wipes chosen parts of one shop's data. The shop, its branches, users, roles
 * and settings stay. Parts other parts depend on are ticked for you, and the
 * button unlocks only once the shop's name is typed exactly.
 */
export function ResetTenantDataDialog({
  tenantId,
  isOpen,
  onClose,
}: {
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const { data, isLoading, error, refetch } = useTenantResetPreview(tenantId, isOpen);
  const reset = useResetTenantData(tenantId);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [confirmName, setConfirmName] = useState("");

  const parts = useMemo(() => data?.parts ?? [], [data?.parts]);
  const effective = useMemo(() => withRequired(chosen, parts), [chosen, parts]);
  const rows = parts.filter((p) => effective.has(p.key)).reduce((sum, p) => sum + p.rows, 0);
  const nameMatches = Boolean(data) && confirmName.trim() === data!.tenant.name.trim();

  const close = () => {
    setChosen(new Set());
    setConfirmName("");
    onClose();
  };

  const toggle = (key: string) =>
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const run = () =>
    reset.mutate(
      { parts: [...chosen], confirmName },
      {
        onSuccess: (result) => {
          const total = Object.values(result.deleted).reduce((sum, n) => sum + n, 0);
          toast.success(`Reset done: ${total.toLocaleString()} records deleted.`);
          void refetch();
          close();
        },
        onError: (err) => toast.error(getHttpErrorMessage(err, "Reset failed; nothing was deleted.")),
      },
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Reset data"
      description="Deletes this shop's data permanently. The shop, branches, users, roles and shop settings stay."
      maxWidth="2xl"
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button type="button" variant="outline" onClick={close} disabled={reset.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            className="!border-red-600 !bg-red-600 !text-white hover:!bg-red-700"
            disabled={!chosen.size || !nameMatches || reset.isPending}
            onClick={run}
          >
            {reset.isPending ? "Resetting..." : `Delete ${rows.toLocaleString()} records`}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <AppLoader fullScreen={false} size="sm" message="Counting records..." />
      ) : error || !data ? (
        <p className="text-sm text-red-600">{getHttpErrorMessage(error, "Could not load what would be deleted.")}</p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {parts.map((part) => {
              const forced = effective.has(part.key) && !chosen.has(part.key);
              return (
                <label
                  key={part.key}
                  className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${
                    effective.has(part.key) ? "border-red-300 bg-red-50/60 dark:bg-red-950/20" : "border-border"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-red-600"
                    checked={effective.has(part.key)}
                    disabled={forced}
                    onChange={() => toggle(part.key)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-medium">{part.label}</span>
                      <span className="shrink-0 text-xs text-muted">{part.rows.toLocaleString()} records</span>
                    </span>
                    <span className="block text-xs text-muted">{part.description}</span>
                    {forced ? (
                      <span className="block text-xs text-red-700">Included: what you ticked depends on it.</span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
          <div className="space-y-2 rounded-lg border border-red-300 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-red-700">
              <AlertTriangle className="h-4 w-4" /> This cannot be undone.
            </p>
            <label className="block text-sm">
              Type <span className="font-semibold">{data.tenant.name}</span> to confirm
              <Input
                className="mt-1"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                autoComplete="off"
              />
            </label>
          </div>
        </div>
      )}
    </Modal>
  );
}
