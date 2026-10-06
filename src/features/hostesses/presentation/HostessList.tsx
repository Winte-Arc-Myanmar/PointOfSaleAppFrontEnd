"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import type { DataTableAction, DataTableColumn } from "@/presentation/components/data-table";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useDeleteHostess, useHostesses } from "@/presentation/hooks/useHostesses";
import type { Hostess } from "@/core/domain/entities/Hostess";
import { apiErrorMessage } from "@/lib/api-error";
import { CreateHostessForm } from "./CreateHostessForm";

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;
const REFRESH_MS = 60_000;

const clock = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function Whereabouts({ hostess }: { hostess: Hostess }) {
  if (!hostess.isActive) {
    return <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Off</span>;
  }
  if (!hostess.inRoom) {
    return <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Free</span>;
  }
  const { roomNumber, until } = hostess.inRoom;
  return (
    <span className="inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
      In room {roomNumber}
      {until ? ` until ${clock(until)}` : ""}
    </span>
  );
}

export function HostessList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteHostess();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: result, isLoading, error, refetch } = useHostesses({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });
  const hostesses = result?.items ?? [];

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refetch();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [refetch]);

  const columns = useMemo<DataTableColumn<Hostess>[]>(
    () => [
      {
        key: "name",
        header: "Name",
        render: (h) => (
          <button
            type="button"
            className="text-left font-medium hover:text-mint"
            onClick={() => router.push(`/hostesses/${h.id}/edit`)}
          >
            {h.name}
            {h.nickname ? <span className="ml-2 text-sm font-normal text-muted">“{h.nickname}”</span> : null}
          </button>
        ),
      },
      {
        key: "phoneNumber",
        header: "Phone",
        render: (h) => <span className="text-sm text-muted">{h.phoneNumber ?? "—"}</span>,
      },
      {
        key: "inRoom",
        header: "Now",
        render: (h) => <Whereabouts hostess={h} />,
      },
    ],
    [router],
  );

  const actions = useMemo<DataTableAction<Hostess>[]>(
    () => [
      { label: "Edit", onClick: (h) => router.push(`/hostesses/${h.id}/edit`) },
      {
        label: "Remove",
        variant: "destructive",
        onClick: async (h) => {
          const ok = await confirm({
            title: "Remove hostess",
            description: `Remove ${h.name}? Past bills and reports keep her name.`,
            confirmLabel: "Remove",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(h.id, {
              onSuccess: () => toast.success(`${h.name} removed.`),
              onError: (err) => toast.error(apiErrorMessage(err, "Couldn't remove the hostess.")),
            });
          }
        },
      },
    ],
    [router, confirm, del, toast],
  );

  return (
    <EntityListWithCreateModal<Hostess>
      data={hostesses}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading hostesses..."
      emptyText={search ? "No hostesses match your search." : "No hostesses yet. Add the first one."}
      error={
        error ? { message: apiErrorMessage(error, "Failed to load hostesses."), onRetry: () => refetch() } : undefined
      }
      topContent={
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or nickname..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={result?.totalPages ?? pagination.getTotalPages(result?.total)}
      totalItems={result?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add hostess"
      createTitle="Add a hostess"
      createSubmitText="Add hostess"
      createLoadingText="Adding..."
      createFormId="create-hostess-form"
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateHostessForm formId={formId} onSuccess={onSuccess} onLoadingChange={onLoadingChange} />
      )}
    />
  );
}
