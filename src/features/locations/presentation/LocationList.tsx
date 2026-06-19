"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useLocations,
  useLocationTree,
  useDeleteLocation,
} from "@/presentation/hooks/useLocations";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getLocationRowActions } from "./location-row-actions";
import { getLocationTableColumns } from "./location-table-columns";
import { CreateLocationForm } from "./CreateLocationForm";
import { LocationTreePanel } from "./LocationTreePanel";
import type { Location } from "@/core/domain/entities/Location";

const CREATE_LOCATION_FORM_ID = "create-location-form";
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function LocationList() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("__all__");
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });
  const {
    data: locations = [],
    isLoading,
    error,
    refetch,
  } = useLocations({ page: pagination.page, limit: PAGE_SIZE });
  const {
    data: treeRoots = [],
    isLoading: treeLoading,
    error: treeError,
    refetch: refetchTree,
  } = useLocationTree();
  const deleteLocation = useDeleteLocation();
  const toast = useToast();
  const confirm = useConfirm();
  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase();
    const searched = !q
      ? locations
      : locations.filter((l) =>
      [l.name, l.type, l.tenantId, String(l.id)].join(" ").toLowerCase().includes(q),
    );
    if (selectedType === "__all__") return searched;
    return searched.filter((l) => (l.type?.trim() || "__none__") === selectedType);
  }, [locations, search, selectedType]);

  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    locations.forEach((l) => {
      const value = (l.type ?? "").trim();
      if (value) types.add(value);
    });
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [locations]);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.observePageResult(filteredLocations.length);
  }, [filteredLocations.length, pagination]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination]);

  useEffect(() => {
    pagination.reset(1);
  }, [selectedType, pagination]);

  const actions = useMemo(
    () =>
      getLocationRowActions({
        onView: (l) => router.push(`/locations/${l.id}`),
        onEdit: (l) => router.push(`/locations/${l.id}/edit`),
        onDelete: async (l) => {
          const ok = await confirm({
            title: "Delete location",
            description: `Delete "${l.name}"? Child locations may need to be reassigned first.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteLocation.mutate(l.id, {
              onSuccess: () => toast.success("Location deleted."),
              onError: () => toast.error("Failed to delete location."),
            });
          }
        },
      }),
    [router, deleteLocation, toast, confirm]
  );

  const columns = useMemo(
    () =>
      getLocationTableColumns({
        onView: (l) => router.push(`/locations/${l.id}`),
      }),
    [router],
  );

  async function handleDeleteSelected(items: Location[]) {
    if (items.length === 0) return;
    const ok = await confirm({
      title: "Delete locations",
      description: `Delete ${items.length} selected location(s)? Child locations may need to be reassigned first.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      for (const item of items) {
        await deleteLocation.mutateAsync(item.id);
      }
      toast.success(`${items.length} location(s) deleted.`);
    } catch {
      toast.error("Failed to delete some locations.");
    }
  }

  return (
    <div className="space-y-8">
      <EntityListWithCreateModal<Location>
        data={filteredLocations}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText="Loading locations..."
        emptyText={
          search.trim()
            ? "No locations match your search."
            : selectedType !== "__all__"
              ? "No locations match this type."
              : "No locations yet."
        }
        topContent={
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search locations..."
              className="sm:w-[360px]"
            />
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="sm:w-[220px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All types</SelectItem>
                {typeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        error={
          error
            ? {
                message: "Failed to load locations.",
                onRetry: () => refetch(),
              }
            : undefined
        }
        pageSize={10}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        onPageChange={(p) => pagination.setPage(p)}
        addLabel="Add location"
        createTitle="Create location"
        createSubmitText="Create"
        createLoadingText="Creating..."
        createFormId={CREATE_LOCATION_FORM_ID}
        sectionTitle="All locations"
        enableRowSelection
        onEditSelected={(item) => router.push(`/locations/${item.id}/edit`)}
        onDeleteSelected={handleDeleteSelected}
        renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
          <CreateLocationForm
            formId={formId}
            onSuccess={onSuccess}
            onLoadingChange={onLoadingChange}
          />
        )}
      />

      <section>
        <h2 className="section-label mb-3">Hierarchy (from API tree)</h2>
        <p className="text-sm text-muted mb-4 max-w-2xl">
          This shows your location hierarchy. Use the Parent location field when
          creating entries to build the tree.
        </p>
        <LocationTreePanel
          roots={treeRoots}
          isLoading={treeLoading}
          error={treeError ?? null}
          onRetry={() => refetchTree()}
        />
      </section>
    </div>
  );
}
