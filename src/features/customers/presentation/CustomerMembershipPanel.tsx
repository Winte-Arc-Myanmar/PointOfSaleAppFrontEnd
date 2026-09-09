"use client";

import { useMemo, useState } from "react";
import {
  CreditCard,
  Link2,
  Link2Off,
  Power,
  RotateCcw,
  UserPlus,
  Wallet,
  WalletCards,
} from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { FormModal } from "@/presentation/components/modal/FormModal";
import {
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
  useMembershipMembers,
  useMembershipRefund,
  useMembershipTopup,
  useMembershipUnbindCard,
} from "@/presentation/hooks/useMembershipMembers";
import { RegisterMembershipForm } from "@/features/memberships/presentation/RegisterMembershipForm";
import type { Customer } from "@/core/domain/entities/Customer";
import type { MembershipMember } from "@/core/domain/entities/MembershipMember";

export function CustomerMembershipPanel({ customer }: { customer: Customer }) {
  const toast = useToast();
  const confirm = useConfirm();
  const { formatPrice } = useCurrency();
  const { data: membershipsResult, isLoading, refetch } = useMembershipMembers({
    page: 1,
    limit: 200,
  });

  const topup = useMembershipTopup();
  const refund = useMembershipRefund();
  const bindCard = useMembershipBindCard();
  const unbindCard = useMembershipUnbindCard();
  const closeMembership = useMembershipClose();

  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [topupAmount, setTopupAmount] = useState("10000");
  const [topupNote, setTopupNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("1000");
  const [refundReason, setRefundReason] = useState("");
  const [bindCardNumber, setBindCardNumber] = useState("");

  const member = useMemo(() => {
    const items = membershipsResult?.items ?? [];
    return (
      items.find((item) => String(item.customerId) === String(customer.id)) ??
      null
    );
  }, [membershipsResult?.items, customer.id]);

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
    <CustomerMembershipActions
      member={member}
      formatPrice={formatPrice}
      isClosed={member.status === "CLOSED"}
      isBound={member.cardBindStatus === "BOUND" && Boolean(member.cardNumber)}
      topupAmount={topupAmount}
      setTopupAmount={setTopupAmount}
      topupNote={topupNote}
      setTopupNote={setTopupNote}
      refundAmount={refundAmount}
      setRefundAmount={setRefundAmount}
      refundReason={refundReason}
      setRefundReason={setRefundReason}
      bindCardNumber={bindCardNumber}
      setBindCardNumber={setBindCardNumber}
      topupPending={topup.isPending}
      refundPending={refund.isPending}
      bindPending={bindCard.isPending}
      unbindPending={unbindCard.isPending}
      closePending={closeMembership.isPending}
      onTopup={() => {
        const amount = Number(topupAmount);
        if (!(amount > 0)) return toast.error("Enter a topup amount greater than 0.");
        topup.mutate(
          {
            id: String(member.id),
            data: { amount, note: topupNote.trim() || undefined },
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
      }}
      onRefund={() => {
        const amount = Number(refundAmount);
        if (!(amount > 0)) return toast.error("Enter a refund amount greater than 0.");
        if (amount > member.walletBalance) {
          return toast.error("Refund cannot exceed wallet balance.");
        }
        refund.mutate(
          {
            id: String(member.id),
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
      }}
      onBind={() => {
        const cardNumber = bindCardNumber.trim();
        if (!cardNumber) return toast.error("Enter a card number to bind.");
        bindCard.mutate(
          { id: String(member.id), data: { cardNumber } },
          {
            onSuccess: () => {
              toast.success("Card bound.");
              setBindCardNumber("");
              void refetch();
            },
            onError: () => toast.error("Failed to bind card."),
          },
        );
      }}
      onUnbind={async () => {
        const ok = await confirm({
          title: "Unbind card",
          description: `Unbind card ${member.cardNumber}? The membership wallet will remain.`,
          confirmLabel: "Unbind",
          variant: "destructive",
        });
        if (!ok) return;
        unbindCard.mutate(String(member.id), {
          onSuccess: () => {
            toast.success("Card unbound.");
            void refetch();
          },
          onError: () => toast.error("Failed to unbind card."),
        });
      }}
      onClose={async () => {
        const ok = await confirm({
          title: "Close membership",
          description: `Close membership for ${member.customerName}? This cannot be undone.`,
          confirmLabel: "Close membership",
          variant: "destructive",
        });
        if (!ok) return;
        closeMembership.mutate(String(member.id), {
          onSuccess: () => {
            toast.success("Membership closed.");
            void refetch();
          },
          onError: () => toast.error("Failed to close membership."),
        });
      }}
    />
  );
}

function CustomerMembershipActions({
  member,
  formatPrice,
  isClosed,
  isBound,
  topupAmount,
  setTopupAmount,
  topupNote,
  setTopupNote,
  refundAmount,
  setRefundAmount,
  refundReason,
  setRefundReason,
  bindCardNumber,
  setBindCardNumber,
  topupPending,
  refundPending,
  bindPending,
  unbindPending,
  closePending,
  onTopup,
  onRefund,
  onBind,
  onUnbind,
  onClose,
}: {
  member: MembershipMember;
  formatPrice: (value: number) => string;
  isClosed: boolean;
  isBound: boolean;
  topupAmount: string;
  setTopupAmount: (value: string) => void;
  topupNote: string;
  setTopupNote: (value: string) => void;
  refundAmount: string;
  setRefundAmount: (value: string) => void;
  refundReason: string;
  setRefundReason: (value: string) => void;
  bindCardNumber: string;
  setBindCardNumber: (value: string) => void;
  topupPending: boolean;
  refundPending: boolean;
  bindPending: boolean;
  unbindPending: boolean;
  closePending: boolean;
  onTopup: () => void;
  onRefund: () => void;
  onBind: () => void;
  onUnbind: () => void;
  onClose: () => void;
}) {
  const overviewRows = [
    { label: "Membership ID", value: safeText(member.id), mono: true },
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
              <Label htmlFor="customer-topup-note">Note (optional)</Label>
              <Input
                id="customer-topup-note"
                value={topupNote}
                onChange={(e) => setTopupNote(e.target.value)}
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
              <Label htmlFor="customer-refund-reason">Reason (optional)</Label>
              <Input
                id="customer-refund-reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
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
                  <Label htmlFor="customer-bind-card">Card number</Label>
                  <Input
                    id="customer-bind-card"
                    value={bindCardNumber}
                    onChange={(e) => setBindCardNumber(e.target.value)}
                    placeholder="MC-xxxx-xxxx"
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

        <DetailSection title="Close membership" icon={Power}>
          <div className="space-y-3">
            <p className="text-sm text-muted">
              {isClosed
                ? "This membership is already closed."
                : "Closing stops topup, refund, and card bind actions."}
            </p>
            <Button
              type="button"
              variant="destructive"
              onClick={onClose}
              disabled={isClosed || closePending}
            >
              {closePending ? "Closing..." : "Close membership"}
            </Button>
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
