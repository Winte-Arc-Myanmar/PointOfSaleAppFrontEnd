"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Move, Plus } from "lucide-react";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useDiningTables,
  useDeleteDiningTable,
  useUpdateDiningTable,
  useUpdateDiningTableStatus,
} from "@/presentation/hooks/useDiningTables";
import { useDiningZones, useDiningZone } from "@/presentation/hooks/useDiningZones";
import type { DiningTable, DiningTableStatus } from "@/core/domain/entities/DiningTable";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { cn } from "@/lib/utils";
import { CreateDiningTableForm } from "./CreateDiningTableForm";
import { getDiningTableRowActions } from "./dining-table-row-actions";
import { getDiningTableTableColumns } from "./dining-table-table-columns";
import { ZoneTabs } from "@/features/dining/shared/ZoneTabs";
import { TableStatusTabs } from "@/features/dining/shared/TableStatusTabs";
import { FloorPlanCanvas } from "@/features/dining/shared/FloorPlanCanvas";
import { DiningTableTile } from "@/features/dining/shared/DiningTableTile";
import { countTablesByStatus } from "@/features/dining/shared/dining-ui";
import { AppLoader } from "@/presentation/components/loader";

const CREATE_FORM_ID = "create-dining-table-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 12;
const FLOOR_LIMIT = 200;
const LIST_LIMIT = 200;

type ViewMode = "floor" | "list";

export function DiningTableList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteDiningTable();
  const updateTable = useUpdateDiningTable();
  const updateStatus = useUpdateDiningTableStatus();

  const { data: zonesData } = useDiningZones({
    page: 1,
    limit: LIST_LIMIT,
    sortBy: "sortOrder",
    sortOrder: "asc",
  });
  const zones = getPaginatedItems(zonesData);

  const initialZoneId = searchParams.get("zoneId") ?? zones[0]?.id?.toString() ?? null;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(initialZoneId);
  const [statusFilter, setStatusFilter] = useState<DiningTableStatus | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("floor");
  const [arrangeMode, setArrangeMode] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    if (!selectedZoneId && zones[0]?.id) {
      setSelectedZoneId(String(zones[0].id));
    }
  }, [zones, selectedZoneId]);

  useEffect(() => {
    const fromUrl = searchParams.get("zoneId");
    if (fromUrl) setSelectedZoneId(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, selectedZoneId, statusFilter, pagination.reset]);

  const { data: selectedZone } = useDiningZone(selectedZoneId);

  const floorQuery = useDiningTables({
    page: 1,
    limit: FLOOR_LIMIT,
    sortBy: "tableNumber",
    sortOrder: "asc",
    zoneId: selectedZoneId ?? undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    search: search || undefined,
  });

  const listQuery = useDiningTables({
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "tableNumber",
    sortOrder: "asc",
    zoneId: selectedZoneId ?? undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    search: search || undefined,
  });

  const floorTables = floorQuery.data?.items ?? [];
  const listTables = listQuery.data?.items ?? [];
  const allZoneTablesQuery = useDiningTables({
    page: 1,
    limit: FLOOR_LIMIT,
    zoneId: selectedZoneId ?? undefined,
  });
  const statusCounts = useMemo(
    () => countTablesByStatus(allZoneTablesQuery.data?.items ?? []),
    [allZoneTablesQuery.data?.items]
  );

  const actions = useMemo(
    () =>
      getDiningTableRowActions({
        onView: (t) => router.push(`/dining-tables/${t.id}`),
        onEdit: (t) => router.push(`/dining-tables/${t.id}/edit`),
        onDelete: async (t) => {
          const ok = await confirm({
            title: "Remove table",
            description: `Remove table "${t.tableNumber}" from the floor plan?`,
            confirmLabel: "Remove",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(t.id), {
              onSuccess: () => toast.success("Table removed."),
              onError: () => toast.error("Failed to remove table."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getDiningTableTableColumns({
        onView: (t) => router.push(`/dining-tables/${t.id}`),
      }),
    [router]
  );

  const handleQuickStatus = (table: DiningTable, status: DiningTableStatus) => {
    if (table.status === status) return;
    updateStatus.mutate(
      { id: String(table.id), status },
      {
        onSuccess: () => toast.success(`Table ${table.tableNumber} marked ${status.toLowerCase()}.`),
        onError: () => toast.error("Failed to update table status."),
      }
    );
  };

  const handleTablePositionChange = (table: DiningTable, x: number, y: number) => {
    updateTable.mutate(
      {
        id: String(table.id),
        data: {
          zoneId: table.zoneId,
          tableNumber: table.tableNumber,
          maxSeats: table.maxSeats,
          posX: x,
          posY: y,
          shape: table.shape,
          status: table.status,
        },
      },
      {
        onSuccess: () => toast.success(`Table ${table.tableNumber} moved.`),
        onError: () => toast.error("Failed to save table position."),
      }
    );
  };

  const createModal = (
    <FormModal
      isOpen={createOpen}
      onClose={() => setCreateOpen(false)}
      title="Add Table to Floor"
      formId={CREATE_FORM_ID}
      formContent={
        <CreateDiningTableForm
          formId={CREATE_FORM_ID}
          onSuccess={() => setCreateOpen(false)}
          onLoadingChange={setCreateLoading}
          defaultZoneId={selectedZoneId ?? undefined}
        />
      }
      submitText="Add Table"
      loadingText="Adding..."
      isLoading={createLoading}
      maxWidth="2xl"
      className="max-w-[min(96vw,980px)]"
    />
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ZoneTabs zones={zones} value={selectedZoneId} onChange={setSelectedZoneId} />
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => {
                setViewMode("floor");
                setArrangeMode(false);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "floor" ? "bg-background shadow-sm" : "text-muted"
              )}
            >
              <LayoutGrid className="size-3.5" />
              Floor plan
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("list");
                setArrangeMode(false);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "list" ? "bg-background shadow-sm" : "text-muted"
              )}
            >
              <List className="size-3.5" />
              List
            </button>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add table
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search table number..."
          className="max-w-xs"
        />
        <TableStatusTabs
          value={statusFilter}
          onChange={setStatusFilter}
          counts={statusCounts}
        />
      </div>

      {viewMode === "floor" && (
        <>
          {floorQuery.isLoading && (
            <AppLoader fullScreen={false} size="sm" message="Loading floor..." />
          )}
          {floorQuery.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load tables.{" "}
              <button type="button" className="underline" onClick={() => floorQuery.refetch()}>
                Retry
              </button>
            </div>
          )}
          {!floorQuery.isLoading && !floorQuery.error && selectedZoneId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {selectedZone?.name ?? "Floor plan"}
                  </h3>
                  <p className="text-xs text-muted">
                    {arrangeMode
                      ? "Drag tables to rearrange the floor. Positions save when you release."
                      : "Tap a table for details. Use quick status codes below each tile during service."}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant={arrangeMode ? "default" : "outline"}
                    className="gap-1.5"
                    onClick={() => setArrangeMode((v) => !v)}
                  >
                    <Move className="size-3.5" />
                    {arrangeMode ? "Done arranging" : "Arrange layout"}
                  </Button>
                  <p className="text-xs text-muted">{floorTables.length} tables</p>
                </div>
              </div>
              <FloorPlanCanvas
                zone={selectedZone}
                tables={floorTables}
                editable={arrangeMode}
                onTablePositionChange={handleTablePositionChange}
                onTableClick={arrangeMode ? undefined : (t) => router.push(`/dining-tables/${t.id}`)}
              />
              {floorTables.length > 0 && !arrangeMode && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {floorTables.map((table) => (
                    <div key={table.id} className="space-y-2">
                      <DiningTableTile
                        table={table}
                        onClick={() => router.push(`/dining-tables/${table.id}`)}
                      />
                      <div className="flex flex-wrap gap-1 justify-center">
                        {(["AVAILABLE", "OCCUPIED", "DIRTY", "RESERVED"] as DiningTableStatus[]).map(
                          (s) => (
                            <button
                              key={s}
                              type="button"
                              disabled={updateStatus.isPending}
                              onClick={() => handleQuickStatus(table, s)}
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-medium border transition-colors",
                                table.status === s
                                  ? "bg-foreground text-background border-foreground"
                                  : "border-border text-muted hover:text-foreground"
                              )}
                            >
                              {s.slice(0, 3)}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {createModal}
        </>
      )}

      {viewMode === "list" && (
        <EntityListWithCreateModal<DiningTable>
          data={listTables}
          columns={columns}
          actions={actions}
          isLoading={listQuery.isLoading}
          loadingText="Loading tables..."
          emptyText={search ? "No tables match your search." : "No tables on this floor yet."}
          error={
            listQuery.error
              ? { message: "Failed to load tables.", onRetry: () => listQuery.refetch() }
              : undefined
          }
          pageSize={PAGE_SIZE}
          currentPage={pagination.page}
          totalPages={listQuery.data?.totalPages ?? pagination.getTotalPages(listQuery.data?.total)}
          totalItems={listQuery.data?.total ?? 0}
          onPageChange={pagination.setPage}
          createEnabled={false}
          showActionBar={false}
          enableGridView
          defaultViewMode="grid"
          renderGridItem={(table) => (
            <DiningTableTile
              table={table}
              onClick={() => router.push(`/dining-tables/${table.id}`)}
            />
          )}
          gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
          onView={(t) => router.push(`/dining-tables/${t.id}`)}
        />
      )}

      {viewMode === "list" && createModal}
    </div>
  );
}
