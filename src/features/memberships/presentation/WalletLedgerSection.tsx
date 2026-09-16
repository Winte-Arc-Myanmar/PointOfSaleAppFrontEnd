"use client";

import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  DetailRows,
  DetailSection,
  formatDate,
  safeText,
} from "@/presentation/components/detail";
import { TablePagination } from "@/presentation/components/data-table/TablePagination";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { useMembershipLedger } from "@/presentation/hooks/useMembershipMembers";
import type { MembershipLedgerEntry } from "@/core/domain/entities/MembershipMember";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

function getLedgerEntryRows(
  entry: MembershipLedgerEntry,
  formatPrice: (value: number) => string,
) {
  return [
    { label: "Entry ID", value: safeText(entry.id), mono: true },
    { label: "Seq", value: String(entry.sequenceNo) },
    { label: "Type", value: safeText(entry.entryType) },
    { label: "Amount", value: formatPrice(entry.amount) },
    { label: "Purchased Δ", value: formatPrice(entry.purchasedDelta) },
    { label: "Granted Δ", value: formatPrice(entry.grantedDelta) },
    { label: "Balance after", value: formatPrice(entry.balanceAfter) },
    { label: "Guest card ID", value: safeText(entry.guestCardId || "-"), mono: true },
    { label: "Location ID", value: safeText(entry.locationId || "-"), mono: true },
    { label: "POS session ID", value: safeText(entry.posSessionId || "-"), mono: true },
    { label: "Staff user ID", value: safeText(entry.staffUserId || "-"), mono: true },
    {
      label: "Approved by user ID",
      value: safeText(entry.approvedByUserId || "-"),
      mono: true,
    },
    { label: "Source module", value: safeText(entry.sourceModule || "-") },
    { label: "Source record ID", value: safeText(entry.sourceRecordId || "-"), mono: true },
    {
      label: "Corrects entry ID",
      value: safeText(entry.correctsEntryId || "-"),
      mono: true,
    },
    { label: "Reference", value: safeText(entry.reference || "-") },
    { label: "Idempotency key", value: safeText(entry.idempotencyKey || "-"), mono: true },
    { label: "Business date", value: safeText(entry.businessDate || "-") },
    { label: "Created", value: formatDate(entry.createdAt) },
    { label: "Notes", value: safeText(entry.notes || "-") },
  ];
}

export function WalletLedgerSection({ walletId }: { walletId: string }) {
  const { formatPrice } = useCurrency();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const { data: ledgerResult, refetch, isLoading } = useMembershipLedger(walletId, {
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const items = ledgerResult?.items ?? [];
  const total = ledgerResult?.total ?? 0;

  return (
    <DetailSection title="Wallet ledger" icon={ScrollText}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search ledger entries..."
          className="h-10"
        />
        <Button type="button" variant="ghost" onClick={() => void refetch()}>
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">Loading ledger...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">No ledger entries yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-border p-3">
              <DetailRows rows={getLedgerEntryRows(entry, formatPrice)} />
            </div>
          ))}
        </div>
      )}

      {total > PAGE_SIZE ? (
        <TablePagination
          className="mt-4"
          page={pagination.page}
          pageCount={pagination.getTotalPages(total)}
          totalItems={total}
          pageSize={PAGE_SIZE}
          onPageChange={pagination.setPage}
        />
      ) : null}
    </DetailSection>
  );
}
