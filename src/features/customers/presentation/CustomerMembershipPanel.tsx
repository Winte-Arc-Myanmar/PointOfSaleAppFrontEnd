"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CreditCard,
  Link2,
  Link2Off,
  Power,
  RotateCcw,
  Search,
  ShieldAlert,
  UserPlus,
  Wallet,
  WalletCards,
} from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";
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
import { FormModal } from "@/presentation/components/modal/FormModal";
import { CardUidField } from "@/presentation/components/card-reader/CardUidField";
import {
  DetailRows,
  DetailSection,
  formatDate,
  safeText,
} from "@/presentation/components/detail";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useLocations } from "@/presentation/hooks/useLocations";
import { usePaymentMethods } from "@/presentation/hooks/usePaymentMethods";
import { usePosSessions } from "@/presentation/hooks/usePosSessions";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { useToast } from "@/presentation/providers/ToastProvider";
import {
  useMembershipAudit,
  useMembershipBindCard,
  useMembershipBeginSettlement,
  useMembershipCancelSettlement,
  useMembershipCardLookup,
  useMembershipCards,
  useMembershipClose,
  useMembershipMembers,
  useMembershipReplaceCard,
  useMembershipReportLostCard,
  useMembershipRefund,
  useMembershipSettlementQuote,
  useMembershipTopup,
  useMembershipUnbindCard,
  useMembershipVoid,
} from "@/presentation/hooks/useMembershipMembers";
import { RegisterMembershipForm } from "@/features/memberships/presentation/RegisterMembershipForm";
import { WalletLedgerSection } from "@/features/memberships/presentation/WalletLedgerSection";
import { WalletSettlementFlow } from "@/features/memberships/presentation/WalletSettlementFlow";
import { getMembershipOverviewRows } from "@/features/memberships/presentation/membership-overview-rows";
import {
  canVoidWallet,
  getPurchasedBalance,
} from "@/features/memberships/presentation/wallet-settlement-utils";
import type { Customer } from "@/core/domain/entities/Customer";
import type { MembershipMember } from "@/core/domain/entities/MembershipMember";

export function CustomerMembershipPanel({ customer }: { customer: Customer }) {
  const toast = useToast();
  const confirm = useConfirm();
  const { formatPrice } = useCurrency();
  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsData).filter(
    (item) => String(item.tenantId) === String(customer.tenantId),
  );
  const { data: paymentMethodsData } = usePaymentMethods({ page: 1, limit: 200 });
  const paymentMethods = getPaginatedItems(paymentMethodsData).filter(
    (item) => String(item.tenantId) === String(customer.tenantId),
  );
  const { data: posSessionsData } = usePosSessions({ page: 1, limit: 200 });
  const posSessions = getPaginatedItems(posSessionsData).filter(
    (item) => String(item.tenantId) === String(customer.tenantId),
  );
  const { data: membershipsResult, isLoading, refetch } = useMembershipMembers({
    page: 1,
    limit: 200,
  });

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

  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [topupAmount, setTopupAmount] = useState("10000");
  const [topupPaymentMethodId, setTopupPaymentMethodId] = useState("");
  const [topupPosSessionId, setTopupPosSessionId] = useState("");
  const [topupLocationId, setTopupLocationId] = useState("");
  const [topupReference, setTopupReference] = useState("");
  const [topupGuestCardId, setTopupGuestCardId] = useState("");
  const [topupIdempotencyKey, setTopupIdempotencyKey] = useState("");
  const [topupNotes, setTopupNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState("1000");
  const [refundPaymentMethodId, setRefundPaymentMethodId] = useState("");
  const [refundPosSessionId, setRefundPosSessionId] = useState("");
  const [refundLocationId, setRefundLocationId] = useState("");
  const [refundReference, setRefundReference] = useState("");
  const [refundIdempotencyKey, setRefundIdempotencyKey] = useState("");
  const [refundNotes, setRefundNotes] = useState("");
  const [refundApproverToken, setRefundApproverToken] = useState("");
  const [bindCardUid, setBindCardUid] = useState("");
  const [bindLabel, setBindLabel] = useState("Guest 2");
  const [bindRoomNumber, setBindRoomNumber] = useState("");
  const [replaceCardUid, setReplaceCardUid] = useState("");
  const [replaceCardLabel, setReplaceCardLabel] = useState("");
  const [replaceCardRoomNumber, setReplaceCardRoomNumber] = useState("");
  const [replaceTargetCardId, setReplaceTargetCardId] = useState("");
  const [lookupCardUid, setLookupCardUid] = useState("");
  const [voidApproverToken, setVoidApproverToken] = useState("");

  const member = useMemo(() => {
    const items = membershipsResult?.items ?? [];
    return (
      items.find((item) => String(item.customerId) === String(customer.id)) ??
      null
    );
  }, [membershipsResult?.items, customer.id]);
  const walletId = member ? String(member.id) : null;
  const isClosed =
    member?.status === "CLOSED" || member?.status === "VOIDED";
  const { data: walletCards = [], refetch: refetchCards } = useMembershipCards(walletId);
  const { data: settlementQuote, refetch: refetchSettlementQuote } =
    useMembershipSettlementQuote(walletId);
  const { data: walletAudit, refetch: refetchAudit } = useMembershipAudit(walletId);

  if (isLoading) {
    return (
      <DetailSection title="Membership" icon={WalletCards}>
        <AppLoader fullScreen={false} size="sm" message="Loading membership..." />
      </DetailSection>
    );
  }

  if (!member) {
    return (
      <>
        <DetailSection title="Membership" icon={WalletCards}>
          <div className="space-y-3">
            <p className="text-sm text-muted">
              This customer has no membership yet. Register one to enable wallet
              topup/refund and card bind/unbind.
            </p>
            <Button type="button" onClick={() => setRegisterOpen(true)}>
              <UserPlus className="size-4" />
              Register membership
            </Button>
          </div>
        </DetailSection>
        <FormModal
          isOpen={registerOpen}
          onClose={() => setRegisterOpen(false)}
          title="Membership Registration"
          formId="customer-register-membership-form"
          formContent={
            <RegisterMembershipForm
              formId="customer-register-membership-form"
              defaultCustomerId={String(customer.id)}
              defaultTenantId={String(customer.tenantId)}
              onSuccess={() => {
                setRegisterOpen(false);
                void refetch();
              }}
              onLoadingChange={setRegisterLoading}
            />
          }
          submitText="Register"
          loadingText="Registering..."
          isLoading={registerLoading}
          maxWidth="2xl"
        />
      </>
    );
  }

  return (
    <div className="space-y-5">
      <CustomerMembershipActions
      member={member}
      formatPrice={formatPrice}
      isClosed={Boolean(isClosed)}
      isBound={member.cardBindStatus === "BOUND" && Boolean(member.cardNumber)}
      paymentMethods={paymentMethods}
      locations={locations}
      posSessions={posSessions}
      topupAmount={topupAmount}
      setTopupAmount={setTopupAmount}
      topupPaymentMethodId={topupPaymentMethodId}
      setTopupPaymentMethodId={setTopupPaymentMethodId}
      topupPosSessionId={topupPosSessionId}
      setTopupPosSessionId={setTopupPosSessionId}
      topupLocationId={topupLocationId}
      setTopupLocationId={setTopupLocationId}
      topupReference={topupReference}
      setTopupReference={setTopupReference}
      topupGuestCardId={topupGuestCardId}
      setTopupGuestCardId={setTopupGuestCardId}
      topupIdempotencyKey={topupIdempotencyKey}
      setTopupIdempotencyKey={setTopupIdempotencyKey}
      topupNotes={topupNotes}
      setTopupNotes={setTopupNotes}
      refundAmount={refundAmount}
      setRefundAmount={setRefundAmount}
      refundPaymentMethodId={refundPaymentMethodId}
      setRefundPaymentMethodId={setRefundPaymentMethodId}
      refundPosSessionId={refundPosSessionId}
      setRefundPosSessionId={setRefundPosSessionId}
      refundLocationId={refundLocationId}
      setRefundLocationId={setRefundLocationId}
      refundReference={refundReference}
      setRefundReference={setRefundReference}
      refundIdempotencyKey={refundIdempotencyKey}
      setRefundIdempotencyKey={setRefundIdempotencyKey}
      refundNotes={refundNotes}
      setRefundNotes={setRefundNotes}
      refundApproverToken={refundApproverToken}
      setRefundApproverToken={setRefundApproverToken}
      bindCardUid={bindCardUid}
      setBindCardUid={setBindCardUid}
      bindLabel={bindLabel}
      setBindLabel={setBindLabel}
      bindRoomNumber={bindRoomNumber}
      setBindRoomNumber={setBindRoomNumber}
      topupPending={topup.isPending}
      refundPending={refund.isPending}
      bindPending={bindCard.isPending}
      unbindPending={unbindCard.isPending}
      onTopup={() => {
        const amount = Number(topupAmount);
        if (!(amount > 0)) return toast.error("Enter a topup amount greater than 0.");
        if (!topupPaymentMethodId || !topupPosSessionId || !topupLocationId) {
          return toast.error("Topup needs payment method, POS session, and location.");
        }
        topup.mutate(
          {
            id: String(member.id),
            data: {
              amount,
              paymentMethodId: topupPaymentMethodId,
              posSessionId: topupPosSessionId,
              locationId: topupLocationId,
              reference: topupReference.trim() || undefined,
              guestCardId: topupGuestCardId.trim() || undefined,
              idempotencyKey: topupIdempotencyKey.trim() || undefined,
              notes: topupNotes.trim() || undefined,
            },
          },
          {
            onSuccess: () => {
              toast.success("Topup completed.");
              void refetch();
            },
            onError: () => toast.error("Topup failed."),
          },
        );
      }}
      onRefund={() => {
        const amount = Number(refundAmount);
        if (!(amount > 0)) return toast.error("Enter a refund amount greater than 0.");
        const maxRefundable = getPurchasedBalance(member);
        if (amount > maxRefundable) {
          return toast.error(
            "Refund cannot exceed purchased balance. Promotional value cannot be paid out.",
          );
        }
        if (!refundPaymentMethodId || !refundPosSessionId || !refundLocationId) {
          return toast.error("Refund needs payment method, POS session, and location.");
        }
        if (!refundApproverToken.trim()) {
          return toast.error("Refund needs an approver token.");
        }
        refund.mutate(
          {
            id: String(member.id),
            data: {
              amount,
              paymentMethodId: refundPaymentMethodId,
              posSessionId: refundPosSessionId,
              locationId: refundLocationId,
              reference: refundReference.trim() || undefined,
              idempotencyKey: refundIdempotencyKey.trim() || undefined,
              notes: refundNotes.trim() || undefined,
              approverAuthorization: refundApproverToken.trim(),
            },
          },
          {
            onSuccess: () => {
              toast.success("Refund completed.");
              void refetch();
            },
            onError: () => toast.error("Refund failed."),
          },
        );
      }}
      onBind={() => {
        const cardUid = bindCardUid.trim();
        if (!cardUid) return toast.error("Enter a card UID to bind.");
        bindCard.mutate(
          {
            id: String(member.id),
            data: {
              cardUid,
              label: bindLabel.trim() || undefined,
              roomNumber: bindRoomNumber.trim() || undefined,
            },
          },
          {
            onSuccess: () => {
              toast.success("Card bound.");
              setBindCardUid("");
              void refetch();
              void refetchCards();
            },
            onError: () => toast.error("Failed to bind card."),
          },
        );
      }}
      onUnbind={async () => {
        const ok = await confirm({
          title: "Unbind card",
          description: `Unbind card ${member.cardNumber}? The wallet stays active.`,
          confirmLabel: "Unbind",
          variant: "destructive",
        });
        if (!ok) return;
        unbindCard.mutate(
          { id: String(member.id) },
          {
            onSuccess: () => {
              toast.success("Card unbound.");
              void refetch();
              void refetchCards();
            },
            onError: () => toast.error("Failed to unbind card."),
          },
        );
      }}
      />

      <WalletSettlementFlow
        walletId={String(member.id)}
        guestName={member.customerName}
        walletStatus={String(member.status)}
        isClosed={Boolean(isClosed)}
        settlementQuote={settlementQuote}
        formatPrice={formatPrice}
        paymentMethods={paymentMethods}
        locations={locations}
        posSessions={posSessions}
        beginPending={beginSettlement.isPending}
        cancelPending={cancelSettlement.isPending}
        settlePending={closeMembership.isPending}
        onRefreshQuote={() => void refetchSettlementQuote()}
        onBeginSettlement={() =>
          beginSettlement.mutate(String(member.id), {
            onSuccess: () => {
              toast.success("Settlement started — wallet frozen.");
              void refetch();
              void refetchSettlementQuote();
            },
            onError: () => toast.error("Failed to begin settlement."),
          })
        }
        onCancelSettlement={() =>
          cancelSettlement.mutate(String(member.id), {
            onSuccess: () => {
              toast.success("Settlement canceled — wallet spendable again.");
              void refetch();
              void refetchSettlementQuote();
            },
            onError: () => toast.error("Failed to cancel settlement."),
          })
        }
        onSettle={async (data) => {
          const ok = await confirm({
            title: "Settle and close wallet",
            description: `Settle and close wallet for ${member.customerName}? Cards will be retired.`,
            confirmLabel: "Settle and close",
            variant: "destructive",
          });
          if (!ok) return;
          closeMembership.mutate(
            { id: String(member.id), data },
            {
              onSuccess: () => {
                toast.success("Wallet settled and closed.");
                void refetch();
                void refetchCards();
                void refetchSettlementQuote();
                void refetchAudit();
              },
              onError: () => toast.error("Failed to settle wallet."),
            },
          );
        }}
        idPrefix="customer-wallet-checkout"
      />

      <DetailSection title="Guest cards" icon={CreditCard}>
        <div className="mb-3 flex justify-end">
          <Link href="/guest-cards">
            <Button type="button" variant="ghost" size="sm">View all guest cards</Button>
          </Link>
        </div>
        {walletCards.length === 0 ? (
          <p className="text-sm text-muted">No cards linked to this wallet yet.</p>
        ) : (
          <div className="space-y-3">
            {walletCards.map((card) => {
              const cardInactive =
                card.status === "DEACTIVATED" || card.status === "CLOSED";
              return (
                <div
                  key={card.id}
                  className="rounded-lg border border-border p-3 flex flex-col gap-2"
                >
                  <DetailRows
                    rows={[
                      { label: "Card UID", value: safeText(card.cardUid), mono: true },
                      { label: "Status", value: safeText(card.status) },
                      { label: "Label", value: safeText(card.label || "-") },
                      { label: "Room", value: safeText(card.roomNumber || "-") },
                      { label: "Issued at", value: formatDate(card.issuedAt) },
                      {
                        label: "Issued by",
                        value: safeText(card.issuedByUserId || "-"),
                        mono: true,
                      },
                      {
                        label: "Deactivated at",
                        value: card.deactivatedAt ? formatDate(card.deactivatedAt) : "-",
                      },
                      {
                        label: "Replaced by",
                        value: safeText(card.replacedByCardId || "-"),
                        mono: true,
                      },
                    ]}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={unbindCard.isPending || isClosed || cardInactive}
                      onClick={async () => {
                        const ok = await confirm({
                          title: "Unbind card",
                          description: `Take card ${card.cardUid} out of use? This frees the UID for the next guest.`,
                          confirmLabel: "Unbind",
                          variant: "destructive",
                        });
                        if (!ok) return;
                        unbindCard.mutate(
                          { id: String(member.id), cardId: card.id },
                          {
                            onSuccess: () => {
                              toast.success("Card unbound.");
                              void refetch();
                              void refetchCards();
                            },
                            onError: () => toast.error("Failed to unbind card."),
                          },
                        );
                      }}
                    >
                      Unbind
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={reportLostCard.isPending || isClosed || cardInactive}
                      onClick={() =>
                        reportLostCard.mutate(
                          { walletId: String(member.id), cardId: card.id },
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
                      disabled={isClosed || cardInactive}
                      onClick={() => {
                        setReplaceTargetCardId(card.id);
                        setReplaceCardLabel(card.label ?? "");
                        setReplaceCardRoomNumber(card.roomNumber ?? "");
                      }}
                    >
                      Replace this card
                    </Button>
                    <Link href={`/guest-cards/${card.id}`}>
                      <Button type="button" variant="ghost">Open card</Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {walletCards.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CardUidField
              placeholder="New card UID"
              value={replaceCardUid}
              onChange={setReplaceCardUid}
              disabled={isClosed}
            />
            <Input
              placeholder="Label (optional)"
              value={replaceCardLabel}
              onChange={(e) => setReplaceCardLabel(e.target.value)}
              disabled={isClosed}
            />
            <Input
              placeholder="Room number (optional)"
              value={replaceCardRoomNumber}
              onChange={(e) => setReplaceCardRoomNumber(e.target.value)}
              disabled={isClosed}
            />
            <Button
              type="button"
              disabled={replaceCard.isPending || isClosed}
              onClick={() => {
                const target =
                  walletCards.find((card) => card.id === replaceTargetCardId) ??
                  walletCards.find((card) => card.status !== "DEACTIVATED") ??
                  walletCards[0];
                if (!target?.id) return;
                if (!replaceCardUid.trim()) return toast.error("Enter a new card UID.");
                replaceCard.mutate(
                  {
                    walletId: String(member.id),
                    cardId: target.id,
                    data: {
                      newCardUid: replaceCardUid.trim(),
                      label: replaceCardLabel.trim() || undefined,
                      roomNumber: replaceCardRoomNumber.trim() || undefined,
                    },
                  },
                  {
                    onSuccess: () => {
                      toast.success(`Card ${target.cardUid} replaced.`);
                      setReplaceCardUid("");
                      setReplaceTargetCardId("");
                      void refetch();
                      void refetchCards();
                    },
                    onError: () => toast.error("Failed to replace card."),
                  },
                );
              }}
            >
              {replaceTargetCardId
                ? "Replace selected card"
                : "Replace first usable card"}
            </Button>
          </div>
        ) : null}

        <div className="mt-4 space-y-3 rounded-lg border border-border p-3">
          <p className="text-sm font-medium">Lookup card by UID</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CardUidField
              placeholder="04A3B2C1"
              value={lookupCardUid}
              onChange={setLookupCardUid}
              onScanned={(uid) => {
                lookupCard.mutate(uid, {
                  onSuccess: (card) => {
                    if (!card) return toast.error("No active card with that UID.");
                    toast.success(`Found ${card.cardUid} on wallet ${card.walletId}.`);
                  },
                  onError: () => toast.error("Card lookup failed."),
                });
              }}
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
              {lookupCard.isPending ? "Looking up..." : "Lookup"}
            </Button>
          </div>
          {lookupCard.data ? (
            <DetailRows
              rows={[
                { label: "Card UID", value: safeText(lookupCard.data.cardUid), mono: true },
                { label: "Wallet ID", value: safeText(lookupCard.data.walletId), mono: true },
                { label: "Status", value: safeText(lookupCard.data.status) },
                { label: "Label", value: safeText(lookupCard.data.label || "-") },
                { label: "Room", value: safeText(lookupCard.data.roomNumber || "-") },
              ]}
            />
          ) : null}
        </div>
      </DetailSection>

      {walletId ? <WalletLedgerSection walletId={walletId} /> : null}

      <DetailSection title="Wallet audit" icon={ShieldAlert}>
        {walletAudit ? (
          <DetailRows
            rows={[
              { label: "Wallet ID", value: safeText(walletAudit.walletId || walletId), mono: true },
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
                label: "Stored balance",
                value:
                  walletAudit.storedBalance == null
                    ? "-"
                    : formatPrice(walletAudit.storedBalance),
              },
              {
                label: "Replayed balance",
                value:
                  walletAudit.replayedBalance == null
                    ? "-"
                    : formatPrice(walletAudit.replayedBalance),
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
        <p className="text-sm text-muted">
          Only while the wallet is untouched (no spending history). Anything with real
          history must be settled instead of erased. Requires a different manager’s
          bearer token.
        </p>
        {!canVoidWallet(member) && !isClosed ? (
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            This wallet has activity and cannot be voided. Use checkout settlement
            instead.
          </p>
        ) : null}
        <div className="mt-3 grid gap-2">
          <Label htmlFor="customer-void-approver">Approver token</Label>
          <Input
            id="customer-void-approver"
            value={voidApproverToken}
            onChange={(e) => setVoidApproverToken(e.target.value)}
            disabled={isClosed || !canVoidWallet(member)}
          />
        </div>
        <Button
          type="button"
          variant="destructive"
          className="mt-3"
          disabled={voidWallet.isPending || isClosed || !canVoidWallet(member)}
          onClick={async () => {
            if (!voidApproverToken.trim()) {
              return toast.error("Void needs an approver token.");
            }
            const ok = await confirm({
              title: "Void wallet",
              description: `Void wallet for ${member.customerName}? This is only valid if the wallet is untouched.`,
              confirmLabel: "Void",
              variant: "destructive",
            });
            if (!ok) return;
            voidWallet.mutate(
              {
                id: String(member.id),
                data: { approverAuthorization: voidApproverToken.trim() },
              },
              {
                onSuccess: () => {
                  toast.success("Wallet voided.");
                  void refetch();
                  void refetchCards();
                  void refetchSettlementQuote();
                  void refetchAudit();
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
  );
}

function CustomerMembershipActions({
  member,
  formatPrice,
  isClosed,
  isBound,
  paymentMethods,
  locations,
  posSessions,
  topupAmount,
  setTopupAmount,
  topupPaymentMethodId,
  setTopupPaymentMethodId,
  topupPosSessionId,
  setTopupPosSessionId,
  topupLocationId,
  setTopupLocationId,
  topupReference,
  setTopupReference,
  topupGuestCardId,
  setTopupGuestCardId,
  topupIdempotencyKey,
  setTopupIdempotencyKey,
  topupNotes,
  setTopupNotes,
  refundAmount,
  setRefundAmount,
  refundPaymentMethodId,
  setRefundPaymentMethodId,
  refundPosSessionId,
  setRefundPosSessionId,
  refundLocationId,
  setRefundLocationId,
  refundReference,
  setRefundReference,
  refundIdempotencyKey,
  setRefundIdempotencyKey,
  refundNotes,
  setRefundNotes,
  refundApproverToken,
  setRefundApproverToken,
  bindCardUid,
  setBindCardUid,
  bindLabel,
  setBindLabel,
  bindRoomNumber,
  setBindRoomNumber,
  topupPending,
  refundPending,
  bindPending,
  unbindPending,
  onTopup,
  onRefund,
  onBind,
  onUnbind,
}: {
  member: MembershipMember;
  formatPrice: (value: number) => string;
  isClosed: boolean;
  isBound: boolean;
  paymentMethods: Array<{ id: string | number; name: string }>;
  locations: Array<{ id: string | number; name: string }>;
  posSessions: Array<{ id: string | number; status?: string }>;
  topupAmount: string;
  setTopupAmount: (value: string) => void;
  topupPaymentMethodId: string;
  setTopupPaymentMethodId: (value: string) => void;
  topupPosSessionId: string;
  setTopupPosSessionId: (value: string) => void;
  topupLocationId: string;
  setTopupLocationId: (value: string) => void;
  topupReference: string;
  setTopupReference: (value: string) => void;
  topupGuestCardId: string;
  setTopupGuestCardId: (value: string) => void;
  topupIdempotencyKey: string;
  setTopupIdempotencyKey: (value: string) => void;
  topupNotes: string;
  setTopupNotes: (value: string) => void;
  refundAmount: string;
  setRefundAmount: (value: string) => void;
  refundPaymentMethodId: string;
  setRefundPaymentMethodId: (value: string) => void;
  refundPosSessionId: string;
  setRefundPosSessionId: (value: string) => void;
  refundLocationId: string;
  setRefundLocationId: (value: string) => void;
  refundReference: string;
  setRefundReference: (value: string) => void;
  refundIdempotencyKey: string;
  setRefundIdempotencyKey: (value: string) => void;
  refundNotes: string;
  setRefundNotes: (value: string) => void;
  refundApproverToken: string;
  setRefundApproverToken: (value: string) => void;
  bindCardUid: string;
  setBindCardUid: (value: string) => void;
  bindLabel: string;
  setBindLabel: (value: string) => void;
  bindRoomNumber: string;
  setBindRoomNumber: (value: string) => void;
  topupPending: boolean;
  refundPending: boolean;
  bindPending: boolean;
  unbindPending: boolean;
  onTopup: () => void;
  onRefund: () => void;
  onBind: () => void;
  onUnbind: () => void;
}) {
  const overviewRows = getMembershipOverviewRows(member, formatPrice);

  return (
    <div className="space-y-5">
      <DetailSection title="Membership details" icon={WalletCards}>
        <DetailRows rows={overviewRows} />
      </DetailSection>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <DetailSection title="Topup" icon={Wallet}>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="customer-topup-amount">Amount</Label>
              <Input
                id="customer-topup-amount"
                type="number"
                min={0}
                step="0.01"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-topup-payment-method">Payment method</Label>
              <Select
                value={topupPaymentMethodId}
                onValueChange={setTopupPaymentMethodId}
                disabled={isClosed}
              >
                <SelectTrigger id="customer-topup-payment-method">
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
              <Label htmlFor="customer-topup-pos-session">POS session</Label>
              <Select value={topupPosSessionId} onValueChange={setTopupPosSessionId} disabled={isClosed}>
                <SelectTrigger id="customer-topup-pos-session">
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
              <Label htmlFor="customer-topup-location">Location</Label>
              <Select value={topupLocationId} onValueChange={setTopupLocationId} disabled={isClosed}>
                <SelectTrigger id="customer-topup-location">
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
            <div className="grid gap-2">
              <Label htmlFor="customer-topup-reference">Reference (optional)</Label>
              <Input
                id="customer-topup-reference"
                value={topupReference}
                onChange={(e) => setTopupReference(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-topup-guest-card-id">Guest card ID (optional)</Label>
              <Input
                id="customer-topup-guest-card-id"
                value={topupGuestCardId}
                onChange={(e) => setTopupGuestCardId(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-topup-idempotency">Idempotency key (optional)</Label>
              <Input
                id="customer-topup-idempotency"
                value={topupIdempotencyKey}
                onChange={(e) => setTopupIdempotencyKey(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-topup-notes">Notes (optional)</Label>
              <Input
                id="customer-topup-notes"
                value={topupNotes}
                onChange={(e) => setTopupNotes(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <Button type="button" onClick={onTopup} disabled={isClosed || topupPending}>
              {topupPending ? "Processing..." : "Topup"}
            </Button>
          </div>
        </DetailSection>

        <DetailSection title="Refund" icon={RotateCcw}>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="customer-refund-amount">Amount</Label>
              <Input
                id="customer-refund-amount"
                type="number"
                min={0}
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-refund-payment-method">Payment method</Label>
              <Select
                value={refundPaymentMethodId}
                onValueChange={setRefundPaymentMethodId}
                disabled={isClosed}
              >
                <SelectTrigger id="customer-refund-payment-method">
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
              <Label htmlFor="customer-refund-pos-session">POS session</Label>
              <Select value={refundPosSessionId} onValueChange={setRefundPosSessionId} disabled={isClosed}>
                <SelectTrigger id="customer-refund-pos-session">
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
              <Label htmlFor="customer-refund-location">Location</Label>
              <Select value={refundLocationId} onValueChange={setRefundLocationId} disabled={isClosed}>
                <SelectTrigger id="customer-refund-location">
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
            <div className="grid gap-2">
              <Label htmlFor="customer-refund-reference">Reference (optional)</Label>
              <Input
                id="customer-refund-reference"
                value={refundReference}
                onChange={(e) => setRefundReference(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-refund-idempotency">Idempotency key (optional)</Label>
              <Input
                id="customer-refund-idempotency"
                value={refundIdempotencyKey}
                onChange={(e) => setRefundIdempotencyKey(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-refund-notes">Notes (optional)</Label>
              <Input
                id="customer-refund-notes"
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-refund-approver">Approver token</Label>
              <Input
                id="customer-refund-approver"
                value={refundApproverToken}
                onChange={(e) => setRefundApproverToken(e.target.value)}
                disabled={isClosed}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onRefund}
              disabled={isClosed || refundPending}
            >
              {refundPending ? "Processing..." : "Refund"}
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
                  <Label htmlFor="customer-bind-card">Card UID</Label>
                  <CardUidField
                    id="customer-bind-card"
                    value={bindCardUid}
                    onChange={setBindCardUid}
                    placeholder="04A3B2C1"
                    disabled={isClosed}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customer-bind-label">Label (optional)</Label>
                  <Input
                    id="customer-bind-label"
                    value={bindLabel}
                    onChange={(e) => setBindLabel(e.target.value)}
                    placeholder="Guest 2"
                    disabled={isClosed}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customer-bind-room">Room number (optional)</Label>
                  <Input
                    id="customer-bind-room"
                    value={bindRoomNumber}
                    onChange={(e) => setBindRoomNumber(e.target.value)}
                    placeholder="304"
                    disabled={isClosed}
                  />
                </div>
                <Button type="button" onClick={onBind} disabled={isClosed || bindPending}>
                  <Link2 className="size-4" />
                  {bindPending ? "Binding..." : "Bind card"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={onUnbind}
                disabled={isClosed || unbindPending}
              >
                <Link2Off className="size-4" />
                {unbindPending ? "Unbinding..." : "Unbind card"}
              </Button>
            )}
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
