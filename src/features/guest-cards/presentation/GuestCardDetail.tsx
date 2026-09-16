"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { CardUidField } from "@/presentation/components/card-reader/CardUidField";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  formatDate,
  safeText,
} from "@/presentation/components/detail";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useGuestCard } from "@/presentation/hooks/useGuestCards";
import {
  useMembershipReplaceCard,
  useMembershipReportLostCard,
  useMembershipUnbindCard,
} from "@/presentation/hooks/useMembershipMembers";

export function GuestCardDetail({ cardId }: { cardId: string }) {
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const { data: card, isLoading, error, refetch } = useGuestCard(cardId);
  const unbindCard = useMembershipUnbindCard();
  const reportLostCard = useMembershipReportLostCard();
  const replaceCard = useMembershipReplaceCard();
  const [replaceUid, setReplaceUid] = useState("");
  const [replaceLabel, setReplaceLabel] = useState("");
  const [replaceRoom, setReplaceRoom] = useState("");

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

  const inactive =
    card.status === "DEACTIVATED" ||
    card.status === "CLOSED" ||
    card.status === "LOST";

  const refresh = () => {
    void refetch();
    void queryClient.invalidateQueries({ queryKey: ["guest-cards"] });
    void queryClient.invalidateQueries({ queryKey: ["memberships"] });
  };

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

      <DetailSection title="Card actions" icon={CreditCard}>
        <div className="flex flex-wrap gap-3">
          <Link href={`/memberships/${card.walletId}`}>
            <Button type="button" variant="outline">Open wallet</Button>
          </Link>
          {card.replacedByCardId ? (
            <Link href={`/guest-cards/${card.replacedByCardId}`}>
              <Button type="button" variant="ghost">View replacement card</Button>
            </Link>
          ) : null}
          <Button
            type="button"
            variant="outline"
            disabled={inactive || reportLostCard.isPending}
            onClick={() =>
              reportLostCard.mutate(
                { walletId: card.walletId, cardId: card.id },
                {
                  onSuccess: () => {
                    toast.success("Card reported lost.");
                    refresh();
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
            disabled={inactive || unbindCard.isPending}
            onClick={async () => {
              const ok = await confirm({
                title: "Unbind card",
                description: `Take card ${card.cardUid} out of use? This frees the UID for the next guest.`,
                confirmLabel: "Unbind",
                variant: "destructive",
              });
              if (!ok) return;
              unbindCard.mutate(
                { id: card.walletId, cardId: card.id },
                {
                  onSuccess: () => {
                    toast.success("Card unbound.");
                    refresh();
                  },
                  onError: () => toast.error("Failed to unbind card."),
                },
              );
            }}
          >
            Unbind
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="replace-card-uid">Replacement card UID</Label>
            <CardUidField
              id="replace-card-uid"
              value={replaceUid}
              onChange={setReplaceUid}
              disabled={inactive}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="replace-card-label">Label (optional)</Label>
            <Input
              id="replace-card-label"
              value={replaceLabel}
              onChange={(e) => setReplaceLabel(e.target.value)}
              disabled={inactive}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="replace-card-room">Room (optional)</Label>
            <Input
              id="replace-card-room"
              value={replaceRoom}
              onChange={(e) => setReplaceRoom(e.target.value)}
              disabled={inactive}
            />
          </div>
          <Button
            type="button"
            disabled={inactive || replaceCard.isPending}
            onClick={() => {
              if (!replaceUid.trim()) return toast.error("Tap or enter a new card UID.");
              replaceCard.mutate(
                {
                  walletId: card.walletId,
                  cardId: card.id,
                  data: {
                    newCardUid: replaceUid.trim(),
                    label: replaceLabel.trim() || undefined,
                    roomNumber: replaceRoom.trim() || undefined,
                  },
                },
                {
                  onSuccess: () => {
                    toast.success("Card replaced.");
                    setReplaceUid("");
                    refresh();
                  },
                  onError: () => toast.error("Failed to replace card."),
                },
              );
            }}
          >
            {replaceCard.isPending ? "Replacing..." : "Replace card"}
          </Button>
        </div>
      </DetailSection>
    </div>
  );
}
