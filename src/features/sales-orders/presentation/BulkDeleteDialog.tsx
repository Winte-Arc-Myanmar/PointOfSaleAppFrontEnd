"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { useBulkDeleteSalesOrders } from "@/presentation/hooks/useSalesOrders";
import { useToast } from "@/presentation/providers/ToastProvider";
import type { BulkDeleteResult } from "@/core/domain/entities/SalesOrder";
import { apiErrorMessage } from "@/lib/api-error";
import { formatMoney } from "@/lib/money";
import { orderStatusLabel } from "./order-status";

const CONFIRM_WORD = "DELETE";

type DialogProps = {
  ids: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
};

export function BulkDeleteDialog(props: DialogProps) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog
      open={props.open}
      onOpenChange={(next) => !busy && props.onOpenChange(next)}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {props.open ? <DeleteBody {...props} onBusy={setBusy} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function DeleteBody({
  ids,
  onOpenChange,
  onDeleted,
  onBusy,
}: DialogProps & { onBusy: (busy: boolean) => void }) {
  const toast = useToast();
  const bulkDelete = useBulkDeleteSalesOrders();
  const [preview, setPreview] = useState<BulkDeleteResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [typed, setTyped] = useState("");

  const { mutateAsync } = bulkDelete;
  useEffect(() => {
    let cancelled = false;
    mutateAsync({ ids, preview: true })
      .then((result) => {
        if (!cancelled) setPreview(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setPreviewError(
            apiErrorMessage(error, "Couldn't check the selected orders."),
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ids, mutateAsync]);

  const going = preview?.deleted ?? [];
  const skipped = preview?.skipped ?? [];
  const stillOpen = going.filter((o) => o.warnings.includes("OPEN"));
  const closedShift = going.filter((o) => o.warnings.includes("CLOSED_SHIFT"));
  const total = going.reduce((sum, o) => sum + o.grandTotal, 0);
  const deleting = bulkDelete.isPending && preview !== null;
  const canConfirm =
    going.length > 0 &&
    typed.trim().toUpperCase() === CONFIRM_WORD &&
    !deleting;

  const confirm = async () => {
    onBusy(true);
    try {
      const result = await mutateAsync({
        ids: going.map((o) => o.id),
        preview: false,
      });
      const left = result.skipped.length;
      toast.success(
        `${result.deleted.length} order${result.deleted.length === 1 ? "" : "s"} deleted` +
          (left ? `, ${left} left` : "") +
          ".",
      );
      onDeleted();
      onOpenChange(false);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't delete the orders."));
    } finally {
      onBusy(false);
    }
  };

  const plural = (n: number, word: string) =>
    `${n} ${word}${n === 1 ? "" : "s"}`;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {preview
            ? `Delete ${plural(going.length, "sales order")}?`
            : "Delete sales orders?"}
        </DialogTitle>
        <DialogDescription>
          This also deletes their payments, refunds and kitchen tickets. It
          cannot be undone.
        </DialogDescription>
      </DialogHeader>

      {previewError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {previewError}
        </p>
      ) : !preview ? (
        <p className="py-6 text-center text-sm text-muted">
          Checking the selected orders...
        </p>
      ) : (
        <div className="space-y-4 text-sm">
          {going.length > 0 ? (
            <ul className="max-h-56 divide-y divide-border overflow-y-auto rounded-xl border border-border">
              {going.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <span className="min-w-0 truncate font-medium text-foreground">
                    {order.orderNumber}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted">
                      {orderStatusLabel(order.status)}
                    </span>
                    <span className="w-20 text-right font-semibold tabular-nums">
                      {formatMoney(order.grandTotal)}
                    </span>
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between px-3 py-2 font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatMoney(total)}</span>
              </li>
            </ul>
          ) : (
            <p className="text-muted">
              None of the selected orders can be deleted.
            </p>
          )}

          {stillOpen.length > 0 ? (
            <Notice tone="warning">
              {plural(stillOpen.length, "order")}{" "}
              {stillOpen.length === 1 ? "is" : "are"} still open at a table or
              room ({stillOpen.map((o) => o.orderNumber).join(", ")}). The table
              or room will be closed and freed.
            </Notice>
          ) : null}
          {closedShift.length > 0 ? (
            <Notice tone="warning">
              {plural(closedShift.length, "order")}{" "}
              {closedShift.length === 1 ? "is" : "are"} from a closed shift.
              That shift&apos;s report will change.
            </Notice>
          ) : null}
          {skipped.length > 0 ? (
            <Notice tone="info">
              {plural(skipped.length, "order")} can&apos;t be deleted and will
              be left:
              <ul className="mt-1 space-y-0.5">
                {skipped.map((s) => (
                  <li key={s.id}>
                    <span className="font-medium">
                      {s.orderNumber ?? "Unknown order"}
                    </span>{" "}
                    — {s.reason}
                  </li>
                ))}
              </ul>
            </Notice>
          ) : null}

          {going.length > 0 ? (
            <label className="block space-y-1.5">
              <span className="text-muted">
                Type{" "}
                <span className="font-semibold text-foreground">
                  {CONFIRM_WORD}
                </span>{" "}
                to confirm
              </span>
              <Input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                disabled={deleting}
              />
            </label>
          ) : null}
        </div>
      )}

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={deleting}
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={!canConfirm}
          onClick={() => void confirm()}
        >
          {deleting ? "Deleting..." : `Delete ${plural(going.length, "order")}`}
        </Button>
      </DialogFooter>
    </>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "warning" | "info";
  children: React.ReactNode;
}) {
  const Icon = tone === "warning" ? AlertTriangle : Info;
  return (
    <div
      className={
        tone === "warning"
          ? "flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200"
          : "flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 dark:border-border dark:bg-white/5 dark:text-foreground"
      }
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
