"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Info,
  Link2,
  Link2Off,
  Power,
  RotateCcw,
  Wallet,
} from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  formatDate,
  safeText,
} from "@/presentation/components/detail";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { useToast } from "@/presentation/providers/ToastProvider";
import {
  useMembershipBindCard,
  useMembershipClose,
  useMembershipMember,
  useMembershipRefund,
  useMembershipTopup,
  useMembershipUnbindCard,
} from "@/presentation/hooks/useMembershipMembers";

export function MembershipMemberDetail({ membershipId }: { membershipId: string }) {
  const toast = useToast();
  const confirm = useConfirm();
  const { formatPrice } = useCurrency();
  const { data: member, isLoading, error, refetch } = useMembershipMember(membershipId);

  const topup = useMembershipTopup();
  const refund = useMembershipRefund();
  const bindCard = useMembershipBindCard();
  const unbindCard = useMembershipUnbindCard();
  const closeMembership = useMembershipClose();

  const [topupAmount, setTopupAmount] = useState("10000");
  const [topupNote, setTopupNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("1000");
  const [refundReason, setRefundReason] = useState("");
  const [bindCardNumber, setBindCardNumber] = useState("");

  if (isLoading) {
    return <AppLoader fullScreen={false} size="md" message="Loading membership..." />;
  }

  if (error || !member) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Membership not found or failed to load.</p>
        <Link href="/memberships">
          <Button variant="outline">Back to Memberships</Button>
        </Link>
      </div>
    );
  }

  const isClosed = member.status === "CLOSED";
  const isBound = member.cardBindStatus === "BOUND" && Boolean(member.cardNumber);

  const overviewRows = [
    { label: "Membership ID", value: safeText(member.id), mono: true },
    { label: "Customer", value: safeText(member.customerName) },
    { label: "Phone", value: safeText(member.phone || "—") },
    { label: "Email", value: safeText(member.email || "—") },
    { label: "Tier", value: safeText(member.tier) },
    { label: "Card template", value: safeText(member.cardTemplateName) },
    { label: "Wallet balance", value: formatPrice(member.walletBalance) },
    { label: "Card number", value: safeText(member.cardNumber || "Unbound"), mono: true },
    { label: "Card status", value: safeText(member.cardBindStatus) },
    { label: "Membership status", value: safeText(member.status) },
    { label: "Registered at", value: formatDate(member.registeredAt) },
    ...(member.closedAt
      ? [{ label: "Closed at", value: formatDate(member.closedAt) }]
      : []),
  ];

  async function handleTopup() {
    const amount = Number(topupAmount);
    if (!(amount > 0)) return toast.error("Enter a topup amount greater than 0.");
    topup.mutate(
      { id: membershipId, data: { amount, note: topupNote.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success("Topup completed.");
          setTopupNote("");
          void refetch();
        },
        onError: () => toast.error("Topup failed."),
      },
    );
  }

  async function handleRefund() {
    const amount = Number(refundAmount);
    if (!(amount > 0)) return toast.error("Enter a refund amount greater than 0.");
    if (amount > member.walletBalance) {
      return toast.error("Refund cannot exceed wallet balance.");
    }
    refund.mutate(
      {
        id: membershipId,
        data: { amount, reason: refundReason.trim() || undefined },
      },
      {
        onSuccess: () => {
          toast.success("Refund completed.");
          setRefundReason("");
          void refetch();
        },
        onError: () => toast.error("Refund failed."),
      },
    );
  }

  async function handleBind() {
    const cardNumber = bindCardNumber.trim();
    if (!cardNumber) return toast.error("Enter a card number to bind.");
    bindCard.mutate(
      { id: membershipId, data: { cardNumber } },
      {
        onSuccess: () => {
          toast.success("Card bound.");
          setBindCardNumber("");
          void refetch();
        },
        onError: () => toast.error("Failed to bind card."),
      },
    );
  }

  async function handleUnbind() {
    const ok = await confirm({
      title: "Unbind card",
      description: `Unbind card ${member.cardNumber}? The membership wallet will remain.`,
      confirmLabel: "Unbind",
      variant: "destructive",
    });
    if (!ok) return;
    unbindCard.mutate(membershipId, {
      onSuccess: () => {
        toast.success("Card unbound.");
        void refetch();
      },
      onError: () => toast.error("Failed to unbind card."),
    });
  }

  async function handleClose() {
    const ok = await confirm({
      title: "Close membership",
      description: `Close membership for ${member.customerName}? This cannot be undone.`,
      confirmLabel: "Close membership",
      variant: "destructive",
    });
    if (!ok) return;
    closeMembership.mutate(membershipId, {
      onSuccess: () => {
        toast.success("Membership closed.");
        void refetch();
      },
      onError: () => toast.error("Failed to close membership."),
    });
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/memberships"
        backLabel="Memberships"
        title={member.customerName}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <DetailSection title="Membership overview" icon={Info}>
          <DetailRows rows={overviewRows} />
        </DetailSection>

        <DetailSection title="Wallet — Topup" icon={Wallet}>
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Current balance:{" "}
              <span className="font-semibold text-foreground">
                {formatPrice(member.walletBalance)}
              </span>
            </p>
            <div className="grid gap-2">
              <Label htmlFor="topupAmount">Amount</Label>
              <Input
                id="topupAmount"
                type="number"
                min={0}
                step="0.01"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="topupNote">Note (optional)</Label>
              <Input
                id="topupNote"
                value={topupNote}
                onChange={(e) => setTopupNote(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <Button
              type="button"
              onClick={() => void handleTopup()}
              disabled={isClosed || topup.isPending}
            >
              {topup.isPending ? "Processing..." : "Topup"}
            </Button>
          </div>
        </DetailSection>

        <DetailSection title="Wallet — Refund" icon={RotateCcw}>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="refundAmount">Amount</Label>
              <Input
                id="refundAmount"
                type="number"
                min={0}
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="refundReason">Reason (optional)</Label>
              <Input
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleRefund()}
              disabled={isClosed || refund.isPending}
            >
              {refund.isPending ? "Processing..." : "Refund"}
            </Button>
          </div>
        </DetailSection>

        <DetailSection title="Card bind / unbind" icon={CreditCard}>
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Status:{" "}
              <span className="font-semibold text-foreground">
                {isBound ? `Bound (${member.cardNumber})` : "Unbound"}
              </span>
            </p>
            {!isBound ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="bindCardNumber">Card number</Label>
                  <Input
                    id="bindCardNumber"
                    value={bindCardNumber}
                    onChange={(e) => setBindCardNumber(e.target.value)}
                    placeholder="MC-xxxx-xxxx"
                    disabled={isClosed}
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => void handleBind()}
                  disabled={isClosed || bindCard.isPending}
                >
                  <Link2 className="size-4" />
                  {bindCard.isPending ? "Binding..." : "Bind card"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleUnbind()}
                disabled={isClosed || unbindCard.isPending}
              >
                <Link2Off className="size-4" />
                {unbindCard.isPending ? "Unbinding..." : "Unbind card"}
              </Button>
            )}
          </div>
        </DetailSection>

        <DetailSection title="Close membership" icon={Power} className="lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              {isClosed
                ? "This membership is already closed."
                : "Closing stops topup, refund, and card bind actions for this member."}
            </p>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleClose()}
              disabled={isClosed || closeMembership.isPending}
            >
              {closeMembership.isPending ? "Closing..." : "Close membership"}
            </Button>
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
