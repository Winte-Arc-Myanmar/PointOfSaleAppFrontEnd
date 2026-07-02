"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useDeleteKdsStation, useKdsStations } from "@/presentation/hooks/useKdsStations";
import { useLocations } from "@/presentation/hooks/useLocations";
import { usePagination } from "@/presentation/hooks/usePagination";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import type { KdsStation } from "@/core/domain/entities/KdsStation";
import { CreateKdsStationForm } from "./CreateKdsStationForm";
import { getKdsStationRowActions } from "./kds-station-row-actions";
import { getKdsStationTableColumns } from "./kds-station-table-columns";

const CREATE_FORM_ID = "create-kds-station-form";
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const LIST_LIMIT = 200;
const ALL_LOCATIONS = "ALL";

export function KdsStationList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const remove = useDeleteKdsStation();
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState(ALL_LOCATIONS);

  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const locations = getPaginatedItems(locationsData);

  const locationLabelById = useMemo(
    () =>
      locations.reduce(
        (acc, location) => {
          acc[String(location.id)] = location.name;
          return acc;
        },
        {} as Record<string, string>,
      ),
    [locations],
  );

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, locationFilter, pagination.reset]);

  const { data: stationsResult, isLoading, error, refetch } = useKdsStations({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
    locationId: locationFilter !== ALL_LOCATIONS ? locationFilter : undefined,
    sortBy: "name",
    sortOrder: "asc",
  });
  const stations = stationsResult?.items ?? [];

  const actions = useMemo(
    () =>
      getKdsStationRowActions({
        onView: (station) => router.push(`/kds-stations/${station.id}`),
        onEdit: (station) => router.push(`/kds-stations/${station.id}/edit`),
        onDelete: async (station) => {
          const ok = await confirm({
            title: "Delete KDS station",
            description: `Delete "${station.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            remove.mutate(String(station.id), {
              onSuccess: () => toast.success("KDS station deleted."),
              onError: () => toast.error("Failed to delete KDS station."),
            });
          }
        },
      }),
    [router, confirm, remove, toast],
  );

  const columns = useMemo(
    () =>
      getKdsStationTableColumns({
        onView: (station) => router.push(`/kds-stations/${station.id}`),
        locationLabelById,
      }),
    [router, locationLabelById],
  );

  async function handleDeleteSelected(items: KdsStation[]) {
    if (items.length === 0) return;
    const ok = await confirm({
      title: "Delete KDS stations",
      description: `Delete ${items.length} selected station(s)? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      for (const item of items) {
        await remove.mutateAsync(String(item.id));
      }
      toast.success(`${items.length} KDS station(s) deleted.`);
    } catch {
      toast.error("Failed to delete some KDS stations.");
    }
  }

  return (
    <EntityListWithCreateModal<KdsStation>
      data={stations}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading KDS stations..."
      emptyText={search ? "No KDS stations match your search." : "No KDS stations yet."}
      topContent={
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search KDS stations..."
            className="sm:w-[360px]"
          />
          <Select
            value={locationFilter}
            onValueChange={(value) => {
              setLocationFilter(value);
              pagination.reset(1);
            }}
          >
            <SelectTrigger className="sm:w-[280px]">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_LOCATIONS}>All locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={String(location.id)}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      error={
        error
          ? {
              message: "Failed to load KDS stations.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={stationsResult?.totalPages ?? pagination.getTotalPages(stationsResult?.total)}
      totalItems={stationsResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add KDS Station"
      createTitle="Create KDS Station"
      createSubmitText="Create KDS Station"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      enableRowSelection
      onEditSelected={(item) => router.push(`/kds-stations/${item.id}/edit`)}
      onDeleteSelected={handleDeleteSelected}
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateKdsStationForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
