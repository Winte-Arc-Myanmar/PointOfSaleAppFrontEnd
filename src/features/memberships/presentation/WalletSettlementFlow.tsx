"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Lock, Power, Receipt } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { DetailRows, safeText } from "@/presentation/components/detail";
import type {
  MembershipCloseRequest,
  MembershipSettlementQuote,
} from "@/core/domain/entities/MembershipMember";
import { useToast } from "@/presentation/providers/ToastProvider";
import {
  formatSettlementAction,
  needsCollectAtSettlement,
  needsRefundAtSettlement,
  settlementStepState,
} from "./wallet-settlement-utils";

type Option = { id: string | number; name: string };
type PosSessionOption = { id: string | number; status?: string };

function StepBadge({
  number,
  label,
  active,
  done,
}: {
  number: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
        active
          ? "border-mint bg-mint/10 text-foreground"
          : done
            ? "border-border bg-muted/30 text-foreground"
            : "border-border text-muted"
      }`}
    >
      {done ? (
        <CheckCircle2 className="size-4 shrink-0 text-mint" />
      ) : (
        <Circle className="size-4 shrink-0" />
      )}
      <span className="font-medium">{number}.</span>
      <span>{label}</span>
    </div>
  );
}

export function WalletSettlementFlow({
  walletId,
  guestName,
  walletStatus,
  isClosed,
  settlementQuote,
  formatPrice,
  paymentMethods,
  locations,
  posSessions,
  beginPending,
  cancelPending,
  settlePending,
  onRefreshQuote,
  onBeginSettlement,
  onCancelSettlement,
  onSettle,
  idPrefix = "wallet-settlement",
}: {
  walletId: string;
  guestName: string;
  walletStatus: string;
  isClosed: boolean;
  settlementQuote: MembershipSettlementQuote | null | undefined;
  formatPrice: (value: number) => string;
  paymentMethods: Option[];
  locations: Option[];
  posSessions: PosSessionOption[];
  beginPending: boolean;
  cancelPending: boolean;
  settlePending: boolean;
  onRefreshQuote: () => void;
  onBeginSettlement: () => void;
  onCancelSettlement: () => void;
  onSettle: (data: MembershipCloseRequest) => void;
  idPrefix?: string;
}) {
  const toast = useToast();
  const [posSessionId, setPosSessionId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [approverToken, setApproverToken] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [notes, setNotes] = useState("");
  const [refundPaymentMethodId, setRefundPaymentMethodId] = useState("");
  const [refundReference, setRefundReference] = useState("");
  const [collectPaymentMethodId, setCollectPaymentMethodId] = useState("");
  const [collectReference, setCollectReference] = useState("");
  const [collectAmount, setCollectAmount] = useState("");

  const flow = useMemo(
    () =>
      settlementStepState({
        isClosed,
        walletStatus,
        quote: settlementQuote,
      }),
    [isClosed, walletStatus, settlementQuote],
  );

  const showRefundFields = needsRefundAtSettlement(settlementQuote);
  const showCollectFields = needsCollectAtSettlement(settlementQuote);

  useEffect(() => {
    if (!settlementQuote) return;
    if (showCollectFields && !collectAmount) {
      setCollectAmount(String(settlementQuote.collectable));
    }
  }, [settlementQuote, showCollectFields, collectAmount]);

  const quoteRows = settlementQuote
    ? [
        { label: "Wallet number", value: safeText(settlementQuote.walletNumber) },
        { label: "Guest", value: safeText(settlementQuote.guestName || guestName) },
        { label: "Wallet status", value: safeText(settlementQuote.status) },
        {
          label: "Checkout action",
          value: formatSettlementAction(settlementQuote.action),
        },
        { label: "Balance", value: formatPrice(settlementQuote.balance) },
        { label: "Purchased", value: formatPrice(settlementQuote.purchasedBalance) },
        { label: "Granted", value: formatPrice(settlementQuote.grantedBalance) },
        { label: "Refundable", value: formatPrice(settlementQuote.refundable) },
        { label: "Forfeitable", value: formatPrice(settlementQuote.forfeitable) },
        { label: "Collectable", value: formatPrice(settlementQuote.collectable) },
        {
          label: "Blockers",
          value:
            settlementQuote.blockers.length > 0
              ? settlementQuote.blockers
                  .map((b) => `${b.type}: ${b.label || b.id}`)
                  .join(", ")
              : "None",
        },
      ]
    : [];

  const handleSettle = () => {
    if (settleDisabledReason) {
      toast.error(settleDisabledReason);
      return;
    }

    const payload: MembershipCloseRequest = {
      posSessionId,
      locationId,
      approverAuthorization: approverToken.trim(),
      idempotencyKey: idempotencyKey.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (showRefundFields && refundPaymentMethodId) {
      payload.refund = {
        paymentMethodId: refundPaymentMethodId,
        reference: refundReference.trim() || undefined,
      };
    }

    if (showCollectFields && collectPaymentMethodId) {
      const amount = collectAmount.trim() ? Number(collectAmount) : settlementQuote?.collectable;
      payload.collect = {
        paymentMethodId: collectPaymentMethodId,
        reference: collectReference.trim() || undefined,
        amount,
      };
    }

    onSettle(payload);
  };

  const settleDisabledReason = (() => {
    if (isClosed) return "Wallet is already closed.";
    if (!flow.isSettling) return "Begin settlement first to freeze spending.";
    if (flow.hasBlockers) return "Resolve blockers before settling.";
    if (!posSessionId || !locationId) return "Select POS session and location.";
    if (!approverToken.trim()) return "Manager approver token is required.";
    if (showRefundFields && !refundPaymentMethodId) {
      return "Select a refund payment method.";
    }
    if (showCollectFields) {
      if (!collectPaymentMethodId) return "Select a collect payment method.";
      const amount = collectAmount.trim() ? Number(collectAmount) : settlementQuote?.collectable;
      if (!(amount != null && amount > 0)) return "Enter the amount to collect.";
    }
    return null;
  })();

  return (
    <div className="space-y-5 rounded-xl border border-border bg-background p-4 shadow-[var(--shadow-panel)]">
      <div className="flex items-center gap-2">
        <Receipt className="size-4 text-mint" />
        <h3 className="section-label">Wallet checkout</h3>
      </div>
      <p className="text-sm text-muted">
        Follow the steps: review the quote, freeze the wallet so no one can spend
        mid-count, then settle and close.
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <StepBadge
          number={1}
          label="Review quote"
          active={flow.step === 1}
          done={flow.step > 1}
        />
        <StepBadge
          number={2}
          label="Freeze spending"
          active={flow.step === 2}
          done={flow.step > 2}
        />
        <StepBadge
          number={3}
          label="Settle & close"
          active={flow.step === 3}
          done={isClosed}
        />
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Step 1 — Settlement quote</p>
          <Button type="button" variant="ghost" size="sm" onClick={onRefreshQuote}>
            Refresh quote
          </Button>
        </div>
        {settlementQuote ? (
          <DetailRows rows={quoteRows} />
        ) : (
          <p className="text-sm text-muted">
            No quote yet. Refresh to load what closing this wallet would take.
          </p>
        )}
        {flow.hasBlockers ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Blockers must be cleared before you can settle. Resolve open orders or
            other issues first.
          </p>
        ) : null}
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <p className="text-sm font-medium">Step 2 — Freeze spending</p>
        <p className="text-sm text-muted">
          {flow.isSettling
            ? "Wallet is frozen. Cards cannot spend until you settle or cancel."
            : "Begin settlement so the guest cannot spend while you count them out."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!flow.canBegin || beginPending || flow.hasBlockers}
            onClick={onBeginSettlement}
          >
            <Lock className="size-4" />
            {beginPending ? "Starting..." : "Begin settlement"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!flow.canCancel || cancelPending}
            onClick={onCancelSettlement}
          >
            {cancelPending ? "Canceling..." : "Cancel settlement"}
          </Button>
        </div>
        {flow.hasBlockers && !flow.isSettling ? (
          <p className="text-xs text-muted">
            Begin settlement is blocked while checkout blockers exist.
          </p>
        ) : null}
      </div>

      <div
        className={`space-y-3 rounded-lg border p-4 ${
          flow.canSettle ? "border-border" : "border-border opacity-80"
        }`}
      >
        <p className="text-sm font-medium">Step 3 — Settle and close</p>
        <p className="text-sm text-muted">
          {isClosed
            ? "This wallet is already closed."
            : flow.canSettle
              ? "Complete checkout: refund purchased balance, collect postpaid debt, retire cards, and close."
              : "Available after you begin settlement and blockers are cleared."}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor={`${idPrefix}-pos-session`}>POS session</Label>
            <Select
              value={posSessionId}
              onValueChange={setPosSessionId}
              disabled={!flow.canSettle}
            >
              <SelectTrigger id={`${idPrefix}-pos-session`}>
                <SelectValue placeholder="Select POS session" />
              </SelectTrigger>
              <SelectContent>
                {posSessions.map((session) => (
                  <SelectItem key={String(session.id)} value={String(session.id)}>
                    {String(session.id)} ({session.status ?? "UNKNOWN"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${idPrefix}-location`}>Location</Label>
            <Select
              value={locationId}
              onValueChange={setLocationId}
              disabled={!flow.canSettle}
            >
              <SelectTrigger id={`${idPrefix}-location`}>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={String(location.id)} value={String(location.id)}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor={`${idPrefix}-approver`}>Manager approver token</Label>
            <Input
              id={`${idPrefix}-approver`}
              value={approverToken}
              onChange={(e) => setApproverToken(e.target.value)}
              disabled={!flow.canSettle}
              placeholder="Different manager signs in on this terminal"
            />
          </div>
          {showRefundFields ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-refund-pm`}>
                  Refund payment method
                  {settlementQuote ? ` (${formatPrice(settlementQuote.refundable)})` : ""}
                </Label>
                <Select
                  value={refundPaymentMethodId}
                  onValueChange={setRefundPaymentMethodId}
                  disabled={!flow.canSettle}
                >
                  <SelectTrigger id={`${idPrefix}-refund-pm`}>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((pm) => (
                      <SelectItem key={String(pm.id)} value={String(pm.id)}>
                        {pm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-refund-ref`}>Refund reference (optional)</Label>
                <Input
                  id={`${idPrefix}-refund-ref`}
                  value={refundReference}
                  onChange={(e) => setRefundReference(e.target.value)}
                  disabled={!flow.canSettle}
                />
              </div>
            </>
          ) : null}
          {showCollectFields ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-collect-pm`}>Collect payment method</Label>
                <Select
                  value={collectPaymentMethodId}
                  onValueChange={setCollectPaymentMethodId}
                  disabled={!flow.canSettle}
                >
                  <SelectTrigger id={`${idPrefix}-collect-pm`}>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((pm) => (
                      <SelectItem key={String(pm.id)} value={String(pm.id)}>
                        {pm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-collect-amount`}>Collect amount</Label>
                <Input
                  id={`${idPrefix}-collect-amount`}
                  type="number"
                  min={0}
                  step="0.01"
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  disabled={!flow.canSettle}
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor={`${idPrefix}-collect-ref`}>Collect reference (optional)</Label>
                <Input
                  id={`${idPrefix}-collect-ref`}
                  value={collectReference}
                  onChange={(e) => setCollectReference(e.target.value)}
                  disabled={!flow.canSettle}
                />
              </div>
            </>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor={`${idPrefix}-idempotency`}>Idempotency key (optional)</Label>
            <Input
              id={`${idPrefix}-idempotency`}
              value={idempotencyKey}
              onChange={(e) => setIdempotencyKey(e.target.value)}
              disabled={!flow.canSettle}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${idPrefix}-notes`}>Notes (optional)</Label>
            <Input
              id={`${idPrefix}-notes`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!flow.canSettle}
            />
          </div>
        </div>

        {settleDisabledReason && !isClosed ? (
          <p className="text-xs text-muted">{settleDisabledReason}</p>
        ) : null}

        <Button
          type="button"
          variant="destructive"
          disabled={!flow.canSettle || settlePending || Boolean(settleDisabledReason)}
          onClick={handleSettle}
        >
          <Power className="size-4" />
          {settlePending ? "Settling..." : "Settle and close wallet"}
        </Button>
      </div>
    </div>
  );
}
