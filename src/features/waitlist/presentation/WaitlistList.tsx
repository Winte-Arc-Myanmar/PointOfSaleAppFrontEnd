"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { usePagination } from "@/presentation/hooks/usePagination";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import type { WaitlistEntry, WaitlistStatus } from "@/core/domain/entities/Waitlist";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
import {
  useCancelWaitlistEntry,
  useNoShowWaitlistEntry,
  useNotifyWaitlistEntry,
  useWaitlist,
} from "@/presentation/hooks/useWaitlist";
import { CreateWaitlistForm } from "./CreateWaitlistForm";
import { getWaitlistRowActions } from "./waitlist-row-actions";
import { getWaitlistTableColumns } from "./waitlist-table-columns";

const CREATE_FORM_ID = "create-waitlist-form";
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;
const ALL = "__all__";

const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "All statuses", value: ALL },
  { label: "WAITING", value: "WAITING" },
  { label: "NOTIFIED", value: "NOTIFIED" },
  { label: "SEATED", value: "SEATED" },
  { label: "CANCELED", value: "CANCELED" },
  { label: "NO_SHOW", value: "NO_SHOW" },
];

export function WaitlistList() {
  const router = useRouter();
  const toast = useToast();
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [locationId, setLocationId] = useState(ALL);
  const [activeOnly, setActiveOnly] = useState("ACTIVE_ONLY");

  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const { data: tablesData } = useDiningTables({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsData);
  const tables = getPaginatedItems(tablesData);

  const { data: waitlistResult, isLoading, error, refetch } = useWaitlist({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status !== ALL ? (status as WaitlistStatus) : undefined,
    locationId: locationId !== ALL ? locationId : undefined,
    activeOnly: activeOnly === "ACTIVE_ONLY" ? true : undefined,
  });

  const waitlistEntries = waitlistResult?.items ?? [];
  const notify = useNotifyWaitlistEntry();
  const cancel = useCancelWaitlistEntry();
  const noShow = useNoShowWaitlistEntry();

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, status, locationId, activeOnly, pagination.reset]);

  const locationLabelById = useMemo(
    () =>
      locations.reduce(
        (acc, item) => {
          acc[String(item.id)] = item.name;
          return acc;
        },
        {} as Record<string, string>,
      ),
    [locations],
  );

  const tableLabelById = useMemo(
    () =>
      tables.reduce(
        (acc, item) => {
          acc[String(item.id)] = item.tableNumber;
          return acc;
        },
        {} as Record<string, string>,
      ),
    [tables],
  );

  const actions = useMemo(
    () =>
      getWaitlistRowActions({
        onView: (x) => router.push(`/waitlist/${x.id}`),
        onEdit: (x) => router.push(`/waitlist/${x.id}/edit`),
        onSeat: (x) => router.push(`/waitlist/${x.id}`),
        onNotify: (x) =>
          notify.mutate(String(x.id), {
            onSuccess: () => toast.success("Party notified."),
            onError: () => toast.error("Failed to notify party."),
          }),
        onCancel: (x) =>
          cancel.mutate(String(x.id), {
            onSuccess: () => toast.success("Waitlist entry canceled."),
            onError: () => toast.error("Failed to cancel waitlist entry."),
          }),
        onNoShow: (x) =>
          noShow.mutate(String(x.id), {
            onSuccess: () => toast.success("Marked as no-show."),
            onError: () => toast.error("Failed to mark no-show."),
          }),
      }),
    [cancel, noShow, notify, router, toast],
  );

  const columns = useMemo(
    () =>
      getWaitlistTableColumns({
        onView: (x) => router.push(`/waitlist/${x.id}`),
        locationLabelById,
        tableLabelById,
      }),
    [locationLabelById, router, tableLabelById],
  );

  return (
    <EntityListWithCreateModal<WaitlistEntry>
      data={waitlistEntries}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading waitlist..."
      emptyText="No waitlist entries found."
      topContent={
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by guest name..."
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={String(location.id)}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={activeOnly} onValueChange={setActiveOnly}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE_ONLY">Active only</SelectItem>
              <SelectItem value="ALL">All entries</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      error={
        error
          ? {
              message: "Failed to load waitlist.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={waitlistResult?.totalPages ?? pagination.getTotalPages(waitlistResult?.total)}
      totalItems={waitlistResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add to Waitlist"
      createTitle="Add Walk-in Party"
      createSubmitText="Add to Waitlist"
      createLoadingText="Adding..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateWaitlistForm formId={formId} onSuccess={onSuccess} onLoadingChange={onLoadingChange} />
      )}
    />
  );
}
