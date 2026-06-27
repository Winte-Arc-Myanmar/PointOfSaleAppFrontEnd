"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Plus } from "lucide-react";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useDiningZones, useDeleteDiningZone } from "@/presentation/hooks/useDiningZones";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
import type { DiningZone } from "@/core/domain/entities/DiningZone";
import { CreateDiningZoneForm } from "./CreateDiningZoneForm";
import { getDiningZoneRowActions } from "./dining-zone-row-actions";
import { getDiningZoneTableColumns } from "./dining-zone-table-columns";
import { countTablesByStatus } from "@/features/dining/shared/dining-ui";

const CREATE_FORM_ID = "create-dining-zone-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

function ZoneCard({
  zone,
  tableCount,
  availableCount,
  onOpenFloor,
}: {
  zone: DiningZone;
  tableCount: number;
  availableCount: number;
  onOpenFloor: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-sm hover:border-mint/40 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate">{zone.name}</h3>
          <p className="text-xs text-muted mt-1">
            {tableCount} tables · {availableCount} available
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
          #{zone.sortOrder + 1}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" className="gap-1.5" onClick={onOpenFloor}>
          <LayoutGrid className="size-3.5" />
          Open floor
        </Button>
        <Link href={`/dining-zones/${zone.id}/edit`}>
          <Button size="sm" variant="outline">
            Edit zone
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function DiningZoneList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteDiningZone();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: zonesResult, isLoading, error, refetch } = useDiningZones({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "sortOrder",
    sortOrder: "asc",
  });
  const zones = zonesResult?.items ?? [];

  const { data: allTablesResult } = useDiningTables({ page: 1, limit: 500 });
  const tablesByZone = useMemo(() => {
    const map = new Map<string, ReturnType<typeof countTablesByStatus>>();
    for (const zone of zones) {
      const zoneTables = (allTablesResult?.items ?? []).filter(
        (t) => String(t.zoneId) === String(zone.id)
      );
      map.set(String(zone.id), countTablesByStatus(zoneTables));
    }
    return map;
  }, [zones, allTablesResult?.items]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const actions = useMemo(
    () =>
      getDiningZoneRowActions({
        onView: (z) => router.push(`/dining-zones/${z.id}`),
        onEdit: (z) => router.push(`/dining-zones/${z.id}/edit`),
        onDelete: async (z) => {
          const ok = await confirm({
            title: "Delete dining zone",
            description: `Delete "${z.name}" and unassign its tables? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(z.id), {
              onSuccess: () => toast.success("Dining zone deleted."),
              onError: () => toast.error("Failed to delete dining zone."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getDiningZoneTableColumns({
        onView: (z) => router.push(`/dining-zones/${z.id}`),
      }),
    [router]
  );

  return (
    <EntityListWithCreateModal<DiningZone>
      data={zones}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading dining zones..."
      emptyText={search ? "No dining zones match your search." : "No dining zones yet."}
      error={
        error
          ? {
              message: "Failed to load dining zones.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="space-y-4 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search zones (Main Dining, Patio, Bar...)"
          />
          {zones.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {zones.map((zone) => {
                const counts = tablesByZone.get(String(zone.id));
                const total = counts
                  ? Object.values(counts).reduce((a, b) => a + b, 0)
                  : 0;
                return (
                  <ZoneCard
                    key={zone.id}
                    zone={zone}
                    tableCount={total}
                    availableCount={counts?.AVAILABLE ?? 0}
                    onOpenFloor={() => router.push(`/dining-tables?zoneId=${zone.id}`)}
                  />
                );
              })}
            </div>
          )}
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={zonesResult?.totalPages ?? pagination.getTotalPages(zonesResult?.total)}
      totalItems={zonesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Zone"
      createTitle="Create Dining Zone"
      createSubmitText="Create Zone"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateDiningZoneForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
      renderPageHeader={({ openCreate }) => (
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-sm text-muted">
            Set up dining areas and floor layouts, then place tables on each floor.
          </p>
          <Button onClick={openCreate} className="gap-1.5 shrink-0">
            <Plus className="size-4" />
            New zone
          </Button>
        </div>
      )}
    />
  );
}
