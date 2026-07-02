"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useTableSessions } from "@/presentation/hooks/useTableSessions";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
import { useUsers } from "@/presentation/hooks/useUsers";
import { usePagination } from "@/presentation/hooks/usePagination";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import type { TableSession, TableSessionState } from "@/core/domain/entities/TableSession";
import { CreateTableSessionForm } from "./CreateTableSessionForm";
import { getTableSessionRowActions } from "./table-session-row-actions";
import { getTableSessionTableColumns } from "./table-session-table-columns";

const CREATE_FORM_ID = "create-table-session-form";
const PAGE_SIZE = 10;

const STATE_FILTERS: Array<{ label: string; value: string }> = [
  { label: "All states", value: "ALL" },
  { label: "SEATED", value: "SEATED" },
  { label: "ORDERING", value: "ORDERING" },
  { label: "SERVED", value: "SERVED" },
  { label: "PAYMENT_PENDING", value: "PAYMENT_PENDING" },
  { label: "CLOSED", value: "CLOSED" },
];

function getUserLabel(user: any): string {
  return user.fullName || user.username || user.email || String(user.id);
}

export function TableSessionList() {
  const router = useRouter();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const [tableFilter, setTableFilter] = useState<string>("ALL");
  const [waiterFilter, setWaiterFilter] = useState<string>("ALL");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [openOnlyFilter, setOpenOnlyFilter] = useState<string>("OPEN_ONLY");

  const { data: tablesData } = useDiningTables({ page: 1, limit: 200, sortBy: "tableNumber", sortOrder: "asc" });
  const { data: usersData } = useUsers({ page: 1, limit: 200 });
  const tables = getPaginatedItems(tablesData);
  const users = getPaginatedItems(usersData);

  const tableLabelById = useMemo(
    () =>
      tables.reduce(
        (acc, table) => {
          acc[String(table.id)] = table.tableNumber;
          return acc;
        },
        {} as Record<string, string>,
      ),
    [tables],
  );
  const waiterLabelById = useMemo(
    () =>
      users.reduce(
        (acc, user) => {
          acc[String(user.id)] = getUserLabel(user);
          return acc;
        },
        {} as Record<string, string>,
      ),
    [users],
  );

  const { data: sessionsResult, isLoading, error, refetch } = useTableSessions({
    page: pagination.page,
    limit: PAGE_SIZE,
    tableId: tableFilter !== "ALL" ? tableFilter : undefined,
    waiterId: waiterFilter !== "ALL" ? waiterFilter : undefined,
    sessionState: stateFilter !== "ALL" ? (stateFilter as TableSessionState) : undefined,
    openOnly: openOnlyFilter === "OPEN_ONLY" ? true : undefined,
    sortBy: "openedAt",
    sortOrder: "desc",
  });
  const sessions = sessionsResult?.items ?? [];

  const actions = useMemo(
    () =>
      getTableSessionRowActions({
        onView: (session) => router.push(`/table-sessions/${session.id}`),
        onEdit: (session) => router.push(`/table-sessions/${session.id}/edit`),
      }),
    [router],
  );

  const columns = useMemo(
    () =>
      getTableSessionTableColumns({
        onView: (session) => router.push(`/table-sessions/${session.id}`),
        tableLabelById,
        waiterLabelById,
      }),
    [router, tableLabelById, waiterLabelById],
  );

  return (
    <EntityListWithCreateModal<TableSession>
      data={sessions}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading table sessions..."
      emptyText="No table sessions found."
      topContent={
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="grid gap-2">
            <label className="text-xs text-muted">Table</label>
            <Select value={tableFilter} onValueChange={(value) => { setTableFilter(value); pagination.reset(1); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All tables</SelectItem>
                {tables.map((table) => (
                  <SelectItem key={table.id} value={String(table.id)}>
                    {table.tableNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-muted">Waiter</label>
            <Select value={waiterFilter} onValueChange={(value) => { setWaiterFilter(value); pagination.reset(1); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All waiters</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {getUserLabel(user)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-muted">Session state</label>
            <Select value={stateFilter} onValueChange={(value) => { setStateFilter(value); pagination.reset(1); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATE_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-muted">Visibility</label>
            <Select
              value={openOnlyFilter}
              onValueChange={(value) => {
                setOpenOnlyFilter(value);
                pagination.reset(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN_ONLY">Open only</SelectItem>
                <SelectItem value="ALL">All sessions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      }
      error={
        error
          ? {
              message: "Failed to load table sessions.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={sessionsResult?.totalPages ?? pagination.getTotalPages(sessionsResult?.total)}
      totalItems={sessionsResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Open Table Session"
      createTitle="Open Table Session"
      createSubmitText="Open session"
      createLoadingText="Opening..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateTableSessionForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
