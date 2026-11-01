"use client";

import { useEffect } from "react";
import { ChevronDown, History } from "lucide-react";
import { formatDate } from "@/presentation/components/detail";
import { useSalesOrderEdits } from "@/presentation/hooks/useSalesOrders";
import type {
  OrderSnapshot,
  SalesOrderEdit,
} from "@/core/domain/entities/SalesOrderEdit";
import { formatMoney } from "@/lib/money";
import {
  customerChanged,
  lineChanges,
  paymentsChanged,
  totalChanges,
  type LineChange,
} from "./order-edit-diff";
import {
  differenceTone,
  formatDifference,
  personName,
} from "./order-edit-format";

const qty = (value: string) => String(Number(value));

function Arrow({ from, to }: { from: string; to: string }) {
  return (
    <span>
      <span className="text-muted line-through">{from}</span>
      <span className="mx-1.5 text-muted">→</span>
      <span className="font-medium">{to}</span>
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[7rem_1fr] sm:gap-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      <div className="space-y-1 text-sm">{children}</div>
    </div>
  );
}

function LineChangeRow({
  change,
  names,
}: {
  change: LineChange;
  names: Record<string, string>;
}) {
  const hostess = (id: string | null) => (id ? names[id] ?? "Unknown" : "None");
  if (change.kind === "added" || change.kind === "removed") {
    return (
      <div className="flex flex-wrap gap-x-3">
        <span className="font-medium">{change.name}</span>
        <span className={change.kind === "added" ? "text-mint" : "text-red-500"}>
          {change.kind === "added" ? "added" : "removed"}
        </span>
        <span className="text-muted">
          qty {qty(change.quantity)} · {formatMoney(change.unitPrice)}
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-x-3">
      <span className="font-medium">{change.name}</span>
      {change.quantity && (
        <span>
          qty <Arrow from={qty(change.quantity[0])} to={qty(change.quantity[1])} />
        </span>
      )}
      {change.unitPrice && (
        <span>
          price{" "}
          <Arrow
            from={formatMoney(change.unitPrice[0])}
            to={formatMoney(change.unitPrice[1])}
          />
        </span>
      )}
      {change.hostess && (
        <span>
          hostess{" "}
          <Arrow from={hostess(change.hostess[0])} to={hostess(change.hostess[1])} />
        </span>
      )}
    </div>
  );
}

const paymentList = (snapshot: OrderSnapshot) =>
  snapshot.payments.length
    ? snapshot.payments
        .map((payment) => `${payment.method} ${formatMoney(payment.amount)}`)
        .join(", ")
    : "None";

function EditCard({ edit, open }: { edit: SalesOrderEdit; open: boolean }) {
  const { before, after, names } = edit;
  const lines = lineChanges(before, after);
  const totals = totalChanges(before, after);
  const customer = (id: string | null) =>
    id ? names[id] ?? "Unknown customer" : "Walk-in";
  const nothing =
    !lines.length &&
    !totals.length &&
    !paymentsChanged(before, after) &&
    !customerChanged(before, after);

  return (
    <details
      open={open}
      className="group rounded-lg border border-border bg-background/40"
    >
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
        <span className="font-medium">{formatDate(edit.createdAt)}</span>
        <span className="text-muted">
          {personName(edit.editedBy)}, approved by {personName(edit.approvedBy)}
        </span>
        <span className="ml-auto flex items-center gap-2">
          <span>
            {formatMoney(edit.previousTotal)} → {formatMoney(edit.newTotal)}
          </span>
          <span
            className={`font-semibold ${differenceTone(edit.previousTotal, edit.newTotal)}`}
          >
            ({formatDifference(edit.previousTotal, edit.newTotal)})
          </span>
          <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="space-y-3 border-t border-border px-4 py-3">
        <Row label="Reason">{edit.reason}</Row>
        {lines.length > 0 && (
          <Row label="Items">
            {lines.map((change, index) => (
              <LineChangeRow key={index} change={change} names={names} />
            ))}
          </Row>
        )}
        {paymentsChanged(before, after) && (
          <Row label="Payments">
            <Arrow from={paymentList(before)} to={paymentList(after)} />
          </Row>
        )}
        {totals.length > 0 && (
          <Row label="Totals">
            {totals.map((total) => (
              <div key={total.label}>
                {total.label}{" "}
                <Arrow
                  from={formatMoney(total.before)}
                  to={formatMoney(total.after)}
                />
              </div>
            ))}
          </Row>
        )}
        {customerChanged(before, after) && (
          <Row label="Customer">
            <Arrow
              from={customer(before.customerId)}
              to={customer(after.customerId)}
            />
          </Row>
        )}
        {nothing && (
          <p className="text-sm text-muted">No change to items or totals.</p>
        )}
      </div>
    </details>
  );
}

/** The manager-approved edits made to the order after it was paid. */
export function OrderEditHistory({ orderId }: { orderId: string }) {
  const { data: edits = [], isLoading, error } = useSalesOrderEdits(orderId);

  useEffect(() => {
    if (edits.length && window.location.hash === "#edit-history") {
      document.getElementById("edit-history")?.scrollIntoView();
    }
  }, [edits.length]);

  if (isLoading || error || edits.length === 0) return null;

  return (
    <section
      id="edit-history"
      className="scroll-mt-6 rounded-xl border border-border bg-card p-5"
    >
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
        <History className="h-4 w-4 text-mint" />
        Edit history ({edits.length})
      </h2>
      <div className="space-y-3">
        {edits.map((edit, index) => (
          <EditCard key={edit.id} edit={edit} open={index === 0} />
        ))}
      </div>
    </section>
  );
}
