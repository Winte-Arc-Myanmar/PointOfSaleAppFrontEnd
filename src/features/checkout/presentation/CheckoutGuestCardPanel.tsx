"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { CardUidField } from "@/presentation/components/card-reader/CardUidField";
import {
  useMembershipCardLookup,
  useMembershipMember,
} from "@/presentation/hooks/useMembershipMembers";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { safeText } from "@/presentation/components/detail";

export function CheckoutGuestCardPanel({
  onCustomerLinked,
}: {
  onCustomerLinked?: (customerId: string) => void;
}) {
  const toast = useToast();
  const { formatPrice } = useCurrency();
  const lookupCard = useMembershipCardLookup();
  const [cardUid, setCardUid] = useState("");
  const [lookedUpWalletId, setLookedUpWalletId] = useState<string | null>(null);
  const { data: wallet } = useMembershipMember(lookedUpWalletId);

  const runLookup = (uid: string) => {
    const trimmed = uid.trim();
    if (!trimmed) return toast.error("Tap a card or enter a UID.");
    lookupCard.mutate(trimmed, {
      onSuccess: (card) => {
        if (!card) {
          setLookedUpWalletId(null);
          return toast.error("No active card with that UID.");
        }
        setLookedUpWalletId(card.walletId);
        toast.success(`Found ${card.cardUid}.`);
      },
      onError: () => toast.error("Card lookup failed."),
    });
  };

  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-[var(--shadow-panel)]">
      <div className="mb-3 flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-mint" />
        <h3 className="section-label">Guest card</h3>
      </div>
      <p className="mb-3 text-xs text-muted">
        Tap a USB reader or NFC phone, then look up the wallet. Balance is
        informational — checkout still rechecks on the server.
      </p>
      <CardUidField
        value={cardUid}
        onChange={setCardUid}
        onScanned={runLookup}
        disabled={lookupCard.isPending}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={lookupCard.isPending}
          onClick={() => runLookup(cardUid)}
        >
          {lookupCard.isPending ? "Looking up..." : "Lookup"}
        </Button>
        {lookupCard.data ? (
          <Link href={`/guest-cards/${lookupCard.data.id}`}>
            <Button type="button" variant="ghost" size="sm">
              Open card
            </Button>
          </Link>
        ) : null}
      </div>
      {lookupCard.data ? (
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
          <dt className="text-muted">UID</dt>
          <dd className="font-mono">{safeText(lookupCard.data.cardUid)}</dd>
          <dt className="text-muted">Status</dt>
          <dd>{safeText(lookupCard.data.status)}</dd>
          <dt className="text-muted">Guest</dt>
          <dd>{safeText(wallet?.customerName || wallet?.walletNumber || "—")}</dd>
          <dt className="text-muted">Balance</dt>
          <dd>{wallet ? formatPrice(wallet.walletBalance) : "—"}</dd>
          <dt className="text-muted">Wallet</dt>
          <dd>
            <Link
              className="text-mint underline-offset-2 hover:underline"
              href={`/memberships/${lookupCard.data.walletId}`}
            >
              {safeText(wallet?.walletNumber || lookupCard.data.walletId)}
            </Link>
          </dd>
        </dl>
      ) : null}
      {wallet?.customerId && onCustomerLinked ? (
        <Button
          type="button"
          className="mt-3"
          size="sm"
          variant="outline"
          onClick={() => onCustomerLinked(String(wallet.customerId))}
        >
          Use this guest as customer
        </Button>
      ) : null}
    </div>
  );
}
