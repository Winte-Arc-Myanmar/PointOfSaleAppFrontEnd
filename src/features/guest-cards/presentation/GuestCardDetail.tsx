"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";
import { Button } from "@/presentation/components/ui/button";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  formatDate,
  safeText,
} from "@/presentation/components/detail";
import { useGuestCard } from "@/presentation/hooks/useGuestCards";

export function GuestCardDetail({ cardId }: { cardId: string }) {
  const { data: card, isLoading, error } = useGuestCard(cardId);

  if (isLoading) {
    return <AppLoader fullScreen={false} size="md" message="Loading guest card..." />;
  }

  if (error || !card) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Guest card not found or failed to load.</p>
        <Link href="/guest-cards">
          <Button variant="outline">Back to Guest Cards</Button>
        </Link>
      </div>
    );
  }

  const rows = [
    { label: "Card ID", value: safeText(card.id), mono: true },
    { label: "Card UID", value: safeText(card.cardUid), mono: true },
    { label: "Wallet ID", value: safeText(card.walletId), mono: true },
    { label: "Tenant ID", value: safeText(card.tenantId), mono: true },
    { label: "Status", value: safeText(card.status) },
    { label: "Label", value: safeText(card.label || "-") },
    { label: "Room number", value: safeText(card.roomNumber || "-") },
    { label: "Issued at", value: formatDate(card.issuedAt) },
    { label: "Issued by user ID", value: safeText(card.issuedByUserId || "-"), mono: true },
    { label: "Deactivated at", value: formatDate(card.deactivatedAt) },
    {
      label: "Replaced by card ID",
      value: safeText(card.replacedByCardId || "-"),
      mono: true,
    },
    { label: "Created at", value: formatDate(card.createdAt) },
    { label: "Updated at", value: formatDate(card.updatedAt) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/guest-cards"
        backLabel="Guest Cards"
        title={card.cardUid}
      />

      <DetailSection title="Guest card" icon={CreditCard}>
        <DetailRows rows={rows} />
      </DetailSection>

      <div className="flex flex-wrap gap-3">
        <Link href={`/memberships/${card.walletId}`}>
          <Button type="button" variant="outline">Open wallet</Button>
        </Link>
        {card.replacedByCardId ? (
          <Link href={`/guest-cards/${card.replacedByCardId}`}>
            <Button type="button" variant="ghost">View replacement card</Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
