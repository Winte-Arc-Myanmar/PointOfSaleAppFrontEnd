"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useLocations,
  useLocationTree,
  useDeleteLocation,
} from "@/presentation/hooks/useLocations";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getLocationRowActions } from "./location-row-actions";
import { getLocationTableColumns } from "./location-table-columns";
import { CreateLocationForm } from "./CreateLocationForm";
import { LocationTreePanel } from "./LocationTreePanel";
import type { Location } from "@/core/domain/entities/Location";

const CREATE_LOCATION_FORM_ID = "create-location-form";

export function LocationList() {
  const router = useRouter();
  const {
    data: locations = [],
    isLoading,
    error,
    refetch,
  } = useLocations({ page: 1, limit: 50 });
  const {
    data: treeRoots = [],
    isLoading: treeLoading,
    error: treeError,
    refetch: refetchTree,
  } = useLocationTree();
  const deleteLocation = useDeleteLocation();
  const toast = useToast();
  const confirm = useConfirm();

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

  const columns = useMemo(() => getLocationTableColumns(), []);

  return (
    <div className="space-y-8">
      <EntityListWithCreateModal<Location>
        data={locations}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText="Loading locations..."
        emptyText="No locations yet."
        error={
          error
            ? {
                message: "Failed to load locations.",
                onRetry: () => refetch(),
              }
            : undefined
        }
        pageSize={10}
        addLabel="Add location"
        createTitle="Create location"
        createSubmitText="Create"
        createLoadingText="Creating..."
        createFormId={CREATE_LOCATION_FORM_ID}
        sectionTitle="All locations"
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
          Nested structure from{" "}
          <code className="rounded bg-muted px-1 text-xs">GET /v1/locations/tree</code>
          . Use parent location when creating entries to build this tree.
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
