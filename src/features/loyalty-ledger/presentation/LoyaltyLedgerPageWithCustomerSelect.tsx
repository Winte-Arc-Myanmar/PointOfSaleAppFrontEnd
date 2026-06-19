"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ILoyaltyLedgerService } from "@/core/domain/services/ILoyaltyLedgerService";
import type { LoyaltyLedgerEntry } from "@/core/domain/entities/LoyaltyLedgerEntry";
import { DataTable } from "@/presentation/components/data-table";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useCustomers } from "@/presentation/hooks/useCustomers";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useDeleteLoyaltyLedgerEntry } from "@/presentation/hooks/useLoyaltyLedger";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import { LoyaltyLedgerList } from "./LoyaltyLedgerList";
import { getLoyaltyLedgerTableColumns } from "./loyalty-ledger-table-columns";
import { getLoyaltyLedgerRowActions } from "./loyalty-ledger-row-actions";

const CUSTOMER_LIST_LIMIT = 500;
const ALL_CUSTOMERS = "__all__";
const PER_CUSTOMER_FETCH_LIMIT = 50;

function toTimestamp(value?: string | null): number {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

export function LoyaltyLedgerPageWithCustomerSelect() {
  const { t } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const deleteEntry = useDeleteLoyaltyLedgerEntry();
  const { data: customers = [], isLoading } = useCustomers({
    page: 1,
    limit: CUSTOMER_LIST_LIMIT,
  });
  const [selectedId, setSelectedId] = useState<string>(ALL_CUSTOMERS);

  const sorted = useMemo(
    () => [...customers].sort((a, b) => a.name.localeCompare(b.name)),
    [customers],
  );

  const allRowsQuery = useQuery({
    queryKey: ["loyalty-ledger", "all-customers", sorted.map((c) => c.id)],
    enabled: sorted.length > 0,
    queryFn: async () => {
      const service = container.resolve<ILoyaltyLedgerService>(
        "loyaltyLedgerService",
      );
      const lists = await Promise.all(
        sorted.map((customer) =>
          service.getAll(String(customer.id), {
            page: 1,
            limit: PER_CUSTOMER_FETCH_LIMIT,
          }),
        ),
      );
      return lists
        .flat()
        .sort(
          (a, b) =>
            toTimestamp(b.createdAt ?? b.updatedAt) -
            toTimestamp(a.createdAt ?? a.updatedAt),
        );
    },
  });

  const columns = useMemo(
    () =>
      getLoyaltyLedgerTableColumns({
        onView: (row) => router.push(`/loyalty-ledger/${row.customerId}/${row.id}`),
      }),
    [router],
  );

  const actions = useMemo(
    () =>
      getLoyaltyLedgerRowActions({
        onView: (row) => router.push(`/loyalty-ledger/${row.customerId}/${row.id}`),
        onEdit: (row) =>
          router.push(`/loyalty-ledger/${row.customerId}/${row.id}/edit`),
        onDelete: async (row: LoyaltyLedgerEntry) => {
          const ok = await confirm({
            title: "Delete loyalty entry",
            description: `Delete ${row.transactionType} (${row.points} pts)? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (!ok) return;
          deleteEntry.mutate(
            { customerId: row.customerId, entryId: String(row.id) },
            {
              onSuccess: async () => {
                toast.success("Loyalty entry deleted.");
                await allRowsQuery.refetch();
              },
              onError: () => toast.error("Failed to delete loyalty entry."),
            },
          );
        },
      }),
    [router, confirm, deleteEntry, toast, allRowsQuery],
  );

  const isAllMode = selectedId === ALL_CUSTOMERS;

  return (
    <div className="space-y-6">
      <div className="grid gap-2 max-w-md">
        <Label htmlFor="customer-select">{t("common.customer")}</Label>
        <Select
          value={selectedId}
          onValueChange={setSelectedId}
          disabled={isLoading}
        >
          <SelectTrigger id="customer-select">
            <SelectValue
              placeholder={
                isLoading ? t("common.loadingCustomers") : t("common.allCustomers")
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CUSTOMERS}>{t("common.allCustomers")}</SelectItem>
            {sorted.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isAllMode ? (
        <DataTable<LoyaltyLedgerEntry>
          data={allRowsQuery.data ?? []}
          columns={columns}
          actions={actions}
          isLoading={allRowsQuery.isLoading}
          loadingText={t("loyaltyPage.loadingLoyaltyLedger")}
          emptyText={t("loyaltyPage.noLoyaltyEntriesYet")}
          error={
            allRowsQuery.error
              ? {
                  message: t("loyaltyPage.failedToLoadLoyaltyLedger"),
                  onRetry: () => allRowsQuery.refetch(),
                }
              : undefined
          }
          pageSize={10}
        />
      ) : (
        <LoyaltyLedgerList
          customerId={selectedId}
          routeBasePath={`/loyalty-ledger/${selectedId}`}
        />
      )}
    </div>
  );
}
