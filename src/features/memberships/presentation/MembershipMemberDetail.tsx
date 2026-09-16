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
  Search,
  ShieldAlert,
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
  useMembershipAudit,
  useMembershipBeginSettlement,
  useMembershipBindCard,
  useMembershipCancelSettlement,
  useMembershipCardLookup,
  useMembershipCards,
  useMembershipClose,
  useMembershipMember,
  useMembershipRefund,
  useMembershipReplaceCard,
  useMembershipReportLostCard,
  useMembershipSettlementQuote,
  useMembershipTopup,
  useMembershipUnbindCard,
  useMembershipVoid,
} from "@/presentation/hooks/useMembershipMembers";
import { WalletLedgerSection } from "@/features/memberships/presentation/WalletLedgerSection";
import { getMembershipOverviewRows } from "@/features/memberships/presentation/membership-overview-rows";

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
  const beginSettlement = useMembershipBeginSettlement();
  const cancelSettlement = useMembershipCancelSettlement();
  const reportLostCard = useMembershipReportLostCard();
  const replaceCard = useMembershipReplaceCard();
  const lookupCard = useMembershipCardLookup();
  const voidWallet = useMembershipVoid();
  const { data: walletCards = [], refetch: refetchCards } = useMembershipCards(membershipId);
  const { data: settlementQuote, refetch: refetchSettlementQuote } =
    useMembershipSettlementQuote(membershipId);
  const { data: walletAudit, refetch: refetchAudit } = useMembershipAudit(membershipId);

  const [topupAmount, setTopupAmount] = useState("10000");
  const [topupNote, setTopupNote] = useState("");
  const [topupPaymentMethodId, setTopupPaymentMethodId] = useState("");
  const [topupPosSessionId, setTopupPosSessionId] = useState("");
  const [topupLocationId, setTopupLocationId] = useState("");
  const [refundAmount, setRefundAmount] = useState("1000");
  const [refundReason, setRefundReason] = useState("");
  const [refundPaymentMethodId, setRefundPaymentMethodId] = useState("");
  const [refundPosSessionId, setRefundPosSessionId] = useState("");
  const [refundLocationId, setRefundLocationId] = useState("");
  const [bindCardNumber, setBindCardNumber] = useState("");
  const [closePosSessionId, setClosePosSessionId] = useState("");
  const [closeLocationId, setCloseLocationId] = useState("");
  const [refundApproverToken, setRefundApproverToken] = useState("");
  const [closeApproverToken, setCloseApproverToken] = useState("");
  const [replaceCardUid, setReplaceCardUid] = useState("");
  const [lookupCardUid, setLookupCardUid] = useState("");
  const [voidApproverToken, setVoidApproverToken] = useState("");

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

  const activeMember = member;
  const isClosed =
    activeMember.status === "CLOSED" || activeMember.status === "VOIDED";
  const isBound =
    activeMember.cardBindStatus === "BOUND" && Boolean(activeMember.cardNumber);

  const overviewRows = getMembershipOverviewRows(member, formatPrice);

  async function handleTopup() {
    const amount = Number(topupAmount);
    if (!(amount > 0)) return toast.error("Enter a topup amount greater than 0.");
    if (!topupPaymentMethodId || !topupPosSessionId || !topupLocationId) {
      return toast.error("Topup needs payment method, POS session, and location.");
    }
    topup.mutate(
      {
        id: membershipId,
        data: {
          amount,
          paymentMethodId: topupPaymentMethodId,
          posSessionId: topupPosSessionId,
          locationId: topupLocationId,
          notes: topupNote.trim() || undefined,
        },
      },
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
    if (amount > activeMember.walletBalance) {
      return toast.error("Refund cannot exceed wallet balance.");
    }
    if (!refundPaymentMethodId || !refundPosSessionId || !refundLocationId) {
      return toast.error("Refund needs payment method, POS session, and location.");
    }
    if (!refundApproverToken.trim()) {
      return toast.error("Refund needs an approver token.");
    }
    refund.mutate(
      {
        id: membershipId,
        data: {
          amount,
          paymentMethodId: refundPaymentMethodId,
          posSessionId: refundPosSessionId,
          locationId: refundLocationId,
          notes: refundReason.trim() || undefined,
          approverAuthorization: refundApproverToken.trim(),
        },
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
      { id: membershipId, data: { cardUid: cardNumber } },
      {
        onSuccess: () => {
          toast.success("Card bound.");
          setBindCardNumber("");
          void refetch();
          void refetchCards();
        },
        onError: () => toast.error("Failed to bind card."),
      },
    );
  }

  async function handleUnbind() {
    const ok = await confirm({
      title: "Unbind card",
      description: `Unbind card ${activeMember.cardNumber}? The membership wallet will remain.`,
      confirmLabel: "Unbind",
      variant: "destructive",
    });
    if (!ok) return;
    unbindCard.mutate(
      { id: membershipId },
      {
        onSuccess: () => {
          toast.success("Card unbound.");
          void refetch();
          void refetchCards();
        },
        onError: () => toast.error("Failed to unbind card."),
      },
    );
  }

  async function handleClose() {
    const ok = await confirm({
      title: "Settle and close wallet",
      description: `Settle wallet for ${activeMember.customerName}? Begin settlement first if the wallet is still spendable.`,
      confirmLabel: "Settle and close",
      variant: "destructive",
    });
    if (!ok) return;
    if (!closePosSessionId || !closeLocationId) {
      return toast.error("Settle needs POS session and location.");
    }
    if (!closeApproverToken.trim()) {
      return toast.error("Settle needs an approver token.");
    }
    closeMembership.mutate(
      {
        id: membershipId,
        data: {
          posSessionId: closePosSessionId,
          locationId: closeLocationId,
          approverAuthorization: closeApproverToken.trim(),
        },
      },
      {
      onSuccess: () => {
        toast.success("Wallet settled and closed.");
        void refetch();
        void refetchCards();
        void refetchSettlementQuote();
      },
      onError: () => toast.error("Failed to settle wallet."),
      },
    );
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
            <div className="grid gap-2">
              <Label htmlFor="topupPaymentMethodId">Payment method ID</Label>
              <Input
                id="topupPaymentMethodId"
                value={topupPaymentMethodId}
                onChange={(e) => setTopupPaymentMethodId(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="topupPosSessionId">POS session ID</Label>
              <Input
                id="topupPosSessionId"
                value={topupPosSessionId}
                onChange={(e) => setTopupPosSessionId(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="topupLocationId">Location ID</Label>
              <Input
                id="topupLocationId"
                value={topupLocationId}
                onChange={(e) => setTopupLocationId(e.target.value)}
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
            <div className="grid gap-2">
              <Label htmlFor="refundPaymentMethodId">Payment method ID</Label>
              <Input
                id="refundPaymentMethodId"
                value={refundPaymentMethodId}
                onChange={(e) => setRefundPaymentMethodId(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="refundPosSessionId">POS session ID</Label>
              <Input
                id="refundPosSessionId"
                value={refundPosSessionId}
                onChange={(e) => setRefundPosSessionId(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="refundLocationId">Location ID</Label>
              <Input
                id="refundLocationId"
                value={refundLocationId}
                onChange={(e) => setRefundLocationId(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="refundApproverToken">Approver token</Label>
              <Input
                id="refundApproverToken"
                value={refundApproverToken}
                onChange={(e) => setRefundApproverToken(e.target.value)}
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

        <DetailSection title="Settle and close wallet" icon={Power} className="lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              {isClosed
                ? "This wallet is already closed."
                : "Begin settlement first, then settle. Closing refunds purchased value, forfeits grants, retires cards, and closes the wallet."}
            </p>
            <div className="grid w-full gap-2 sm:w-auto">
              <Input
                placeholder="POS session ID"
                value={closePosSessionId}
                onChange={(e) => setClosePosSessionId(e.target.value)}
                disabled={isClosed}
              />
              <Input
                placeholder="Location ID"
                value={closeLocationId}
                onChange={(e) => setCloseLocationId(e.target.value)}
                disabled={isClosed}
              />
              <Input
                placeholder="Approver token"
                value={closeApproverToken}
                onChange={(e) => setCloseApproverToken(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleClose()}
              disabled={isClosed || closeMembership.isPending}
            >
              {closeMembership.isPending ? "Settling..." : "Settle and close"}
            </Button>
          </div>
        </DetailSection>

        <DetailSection title="Guest cards" icon={CreditCard} className="lg:col-span-2">
          {walletCards.length === 0 ? (
            <p className="text-sm text-muted">No cards linked to this wallet yet.</p>
          ) : (
            <div className="space-y-3">
              {walletCards.map((card) => (
                <div key={card.id} className="rounded-lg border border-border p-3 space-y-2">
                  <DetailRows
                    rows={[
                      { label: "Card UID", value: safeText(card.cardUid), mono: true },
                      { label: "Status", value: safeText(card.status) },
                      { label: "Label", value: safeText(card.label || "-") },
                      { label: "Room", value: safeText(card.roomNumber || "-") },
                    ]}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isClosed || reportLostCard.isPending}
                      onClick={() =>
                        reportLostCard.mutate(
                          { walletId: membershipId, cardId: card.id },
                          {
                            onSuccess: () => {
                              toast.success("Card reported lost.");
                              void refetch();
                              void refetchCards();
                            },
                            onError: () => toast.error("Failed to report lost card."),
                          },
                        )
                      }
                    >
                      Report lost
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isClosed || unbindCard.isPending}
                      onClick={() =>
                        unbindCard.mutate(
                          { id: membershipId, cardId: card.id },
                          {
                            onSuccess: () => {
                              toast.success("Card unbound.");
                              void refetch();
                              void refetchCards();
                            },
                            onError: () => toast.error("Failed to unbind card."),
                          },
                        )
                      }
                    >
                      Unbind
                    </Button>
                    <Link href={`/guest-cards/${card.id}`}>
                      <Button type="button" variant="ghost">Open card</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="New card UID"
              value={replaceCardUid}
              onChange={(e) => setReplaceCardUid(e.target.value)}
              disabled={isClosed}
            />
            <Button
              type="button"
              disabled={isClosed || replaceCard.isPending}
              onClick={() => {
                const target = walletCards.find((card) => card.status !== "DEACTIVATED");
                if (!target?.id) return toast.error("No card to replace.");
                if (!replaceCardUid.trim()) return toast.error("Enter a new card UID.");
                replaceCard.mutate(
                  {
                    walletId: membershipId,
                    cardId: target.id,
                    data: { newCardUid: replaceCardUid.trim() },
                  },
                  {
                    onSuccess: () => {
                      toast.success("Card replaced.");
                      setReplaceCardUid("");
                      void refetch();
                      void refetchCards();
                    },
                    onError: () => toast.error("Failed to replace card."),
                  },
                );
              }}
            >
              Replace first usable card
            </Button>
            <Input
              placeholder="Lookup card UID"
              value={lookupCardUid}
              onChange={(e) => setLookupCardUid(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              disabled={lookupCard.isPending}
              onClick={() => {
                const uid = lookupCardUid.trim();
                if (!uid) return toast.error("Enter a card UID to look up.");
                lookupCard.mutate(uid, {
                  onSuccess: (card) => {
                    if (!card) return toast.error("No active card with that UID.");
                    toast.success(`Found ${card.cardUid} on wallet ${card.walletId}.`);
                  },
                  onError: () => toast.error("Card lookup failed."),
                });
              }}
            >
              <Search className="size-4" />
              Lookup
            </Button>
          </div>
        </DetailSection>

        <DetailSection title="Guest wallet settlement" icon={Power} className="lg:col-span-2">
          {settlementQuote ? (
            <DetailRows
              rows={[
                { label: "Action", value: safeText(settlementQuote.action) },
                { label: "Balance", value: formatPrice(settlementQuote.balance) },
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
              ]}
            />
          ) : (
            <p className="text-sm text-muted">No settlement quote available.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isClosed || beginSettlement.isPending}
              onClick={() =>
                beginSettlement.mutate(membershipId, {
                  onSuccess: () => {
                    toast.success("Settlement started.");
                    void refetch();
                    void refetchSettlementQuote();
                  },
                  onError: () => toast.error("Failed to begin settlement."),
                })
              }
            >
              Begin settlement
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isClosed || cancelSettlement.isPending}
              onClick={() =>
                cancelSettlement.mutate(membershipId, {
                  onSuccess: () => {
                    toast.success("Settlement canceled.");
                    void refetch();
                    void refetchSettlementQuote();
                  },
                  onError: () => toast.error("Failed to cancel settlement."),
                })
              }
            >
              Cancel settlement
            </Button>
            <Button type="button" variant="ghost" onClick={() => void refetchSettlementQuote()}>
              Refresh quote
            </Button>
          </div>
        </DetailSection>

        <div className="lg:col-span-2">
          <WalletLedgerSection walletId={membershipId} />
        </div>

        <DetailSection title="Wallet audit" icon={ShieldAlert}>
          {walletAudit ? (
            <DetailRows
              rows={[
                {
                  label: "Balanced",
                  value:
                    walletAudit.balanced == null
                      ? "-"
                      : walletAudit.balanced
                        ? "Yes"
                        : "No",
                },
                {
                  label: "Drift",
                  value: walletAudit.drift == null ? "-" : formatPrice(walletAudit.drift),
                },
                { label: "Message", value: safeText(walletAudit.message || "-") },
              ]}
            />
          ) : (
            <p className="text-sm text-muted">No audit result yet.</p>
          )}
          <Button type="button" variant="ghost" className="mt-2" onClick={() => void refetchAudit()}>
            Recheck ledger
          </Button>
        </DetailSection>

        <DetailSection title="Void wallet" icon={Power}>
          <Input
            placeholder="Approver token"
            value={voidApproverToken}
            onChange={(e) => setVoidApproverToken(e.target.value)}
            disabled={isClosed}
          />
          <Button
            type="button"
            variant="destructive"
            className="mt-3"
            disabled={isClosed || voidWallet.isPending}
            onClick={async () => {
              if (!voidApproverToken.trim()) {
                return toast.error("Void needs an approver token.");
              }
              const ok = await confirm({
                title: "Void wallet",
                description: `Void wallet for ${activeMember.customerName}?`,
                confirmLabel: "Void",
                variant: "destructive",
              });
              if (!ok) return;
              voidWallet.mutate(
                {
                  id: membershipId,
                  data: { approverAuthorization: voidApproverToken.trim() },
                },
                {
                  onSuccess: () => {
                    toast.success("Wallet voided.");
                    void refetch();
                  },
                  onError: () => toast.error("Failed to void wallet."),
                },
              );
            }}
          >
            {voidWallet.isPending ? "Voiding..." : "Void wallet"}
          </Button>
        </DetailSection>
      </div>
    </div>
  );
}
