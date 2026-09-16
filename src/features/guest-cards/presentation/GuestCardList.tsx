"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { CardUidField } from "@/presentation/components/card-reader/CardUidField";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useGuestCards } from "@/presentation/hooks/useGuestCards";
import { useMembershipCardLookup } from "@/presentation/hooks/useMembershipMembers";
import { useToast } from "@/presentation/providers/ToastProvider";
import type { MembershipGuestCard } from "@/core/domain/entities/MembershipMember";
import { getGuestCardTableColumns } from "./guest-card-table-columns";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function GuestCardList() {
  const router = useRouter();
  const toast = useToast();
  const lookupCard = useMembershipCardLookup();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [lookupUid, setLookupUid] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const { data: result, isLoading, error, refetch } = useGuestCards({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const cards = result?.items ?? [];

  const columns = getGuestCardTableColumns({
    onView: (card) => router.push(`/guest-cards/${card.id}`),
  });

  return (
    <EntityListWithCreateModal<MembershipGuestCard>
      data={cards}
      columns={columns}
      actions={[]}
      isLoading={isLoading}
      loadingText="Loading guest cards..."
      emptyText="No guest cards match your search."
      error={
        error
          ? {
              message: "Failed to load guest cards.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={result?.totalPages ?? pagination.getTotalPages(result?.total)}
      totalItems={result?.total ?? 0}
      onPageChange={pagination.setPage}
      createEnabled={false}
      showActionBar={false}
      rootClassName="rounded-[28px] border border-border bg-background/70 p-5 shadow-sm sm:p-8"
      renderPageHeader={() => (
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
              Membership / Customer
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Guest Cards
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              All physical and virtual cards linked to guest wallets across the tenant.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted">
            <CreditCard className="size-4" />
            {result?.total ?? cards.length} cards
          </div>
        </div>
      )}
      topContent={
        <div className="mb-6 space-y-3 rounded-2xl border border-border bg-background/80 p-4 shadow-sm">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by card UID, label, room, or wallet..."
            className="h-11"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <CardUidField
              value={lookupUid}
              onChange={setLookupUid}
              placeholder="Tap or enter UID to look up"
              onScanned={(uid) => {
                lookupCard.mutate(uid, {
                  onSuccess: (card) => {
                    if (!card) return toast.error("No active card with that UID.");
                    router.push(`/guest-cards/${card.id}`);
                  },
                  onError: () => toast.error("Card lookup failed."),
                });
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="h-10"
              disabled={lookupCard.isPending}
              onClick={() => {
                const uid = lookupUid.trim();
                if (!uid) return toast.error("Tap a card or enter a UID.");
                lookupCard.mutate(uid, {
                  onSuccess: (card) => {
                    if (!card) return toast.error("No active card with that UID.");
                    router.push(`/guest-cards/${card.id}`);
                  },
                  onError: () => toast.error("Card lookup failed."),
                });
              }}
            >
              {lookupCard.isPending ? "Looking up..." : "Lookup"}
            </Button>
          </div>
        </div>
      }
      tablePanelClassName="rounded-2xl border border-border bg-background/80 shadow-sm"
      tableContentClassName="px-5 pb-5"
      tablePanelHeader={
        <div className="border-b border-border px-5 py-5">
          <h2 className="text-lg font-semibold text-foreground">Cards</h2>
          <p className="mt-1 text-sm text-muted">
            Open a card to view wallet linkage, status, and replacement history.
          </p>
        </div>
      }
    />
  );
}
