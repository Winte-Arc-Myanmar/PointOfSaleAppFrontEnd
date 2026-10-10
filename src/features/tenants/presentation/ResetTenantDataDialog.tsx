"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/presentation/components/modal/Modal";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { AppLoader } from "@/presentation/components/loader";
import { InfoTip } from "@/presentation/components/ui/info-tip";
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
      description="Pick what to delete for this shop. The shop, branches, users, roles and shop settings always stay."
      maxWidth="xl"
      flush
      headerVariant="mint"
      bodyClassName="max-h-[60vh] min-h-0 flex-1 overflow-y-auto px-6 py-4"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <span className="text-sm text-muted">
            {chosen.size ? `${rows.toLocaleString()} records will be deleted` : "Nothing chosen yet"}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={close} disabled={reset.isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              className="!border-red-600 !bg-red-600 !text-white hover:!bg-red-700 disabled:opacity-50"
              disabled={!chosen.size || !nameMatches || reset.isPending}
              onClick={run}
            >
              {reset.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      }
    >
      {!isOpen ? null : isLoading ? (
        <AppLoader fullScreen={false} size="sm" message="Counting records..." />
      ) : error || !data ? (
        <p className="text-sm text-red-600">{getHttpErrorMessage(error, "Could not load what would be deleted.")}</p>
      ) : (
        <div className="space-y-5">
          <div className="divide-y divide-border rounded-lg border border-border">
            {parts.map((part) => {
              const on = effective.has(part.key);
              const forced = on && !chosen.has(part.key);
              return (
                <label
                  key={part.key}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm ${
                    forced ? "cursor-default" : "cursor-pointer hover:bg-muted/10"
                  } ${on ? "bg-red-500/5" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 accent-red-600"
                    checked={on}
                    disabled={forced}
                    onChange={() => toggle(part.key)}
                  />
                  <span className="min-w-0 flex-1 font-medium">
                    {part.label}
                    <InfoTip text={part.description} />
                  </span>
                  {forced ? (
                    <span className="shrink-0 rounded bg-red-500/10 px-1.5 py-0.5 text-[11px] text-red-600 dark:text-red-400">
                      included
                    </span>
                  ) : null}
                  <span className="w-24 shrink-0 text-right tabular-nums text-muted">
                    {part.rows.toLocaleString()}
                  </span>
                </label>
              );
            })}
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" /> This cannot be undone.
            </p>
            <label className="block text-sm text-muted">
              Type <span className="font-semibold text-foreground">{data.tenant.name}</span> to confirm
              <Input
                className="mt-1.5"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={data.tenant.name}
                autoComplete="off"
              />
            </label>
          </div>
        </div>
      )}
    </Modal>
  );
}
