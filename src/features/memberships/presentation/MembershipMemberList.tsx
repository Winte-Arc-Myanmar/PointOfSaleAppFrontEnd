"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { useMembershipMembers } from "@/presentation/hooks/useMembershipMembers";
import type { MembershipMember } from "@/core/domain/entities/MembershipMember";
import { getMembershipMemberTableColumns } from "./membership-member-table-columns";
import { RegisterMembershipForm } from "./RegisterMembershipForm";

const PAGE_SIZE = 10;
const CREATE_FORM_ID = "register-membership-form";
const SEARCH_DEBOUNCE_MS = 300;

type StatusFilter = "all" | "ACTIVE" | "CLOSED" | "SUSPENDED";

export function MembershipMemberList() {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: result, isLoading, error, refetch } = useMembershipMembers({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sortBy: "registeredAt",
    sortOrder: "desc",
  });

  const members = result?.items ?? [];
  const usingDemoData = members.some((m) => String(m.id).startsWith("mm-"));

  const filtered = useMemo(
    () =>
      members.filter((m) =>
        statusFilter === "all" ? true : m.status === statusFilter,
      ),
    [members, statusFilter],
  );

  useEffect(() => {
    pagination.reset(1);
  }, [search, statusFilter, pagination.reset]);

  const columns = useMemo(
    () =>
      getMembershipMemberTableColumns({
        formatPrice,
        onView: (m) => router.push(`/memberships/${m.id}`),
      }),
    [formatPrice, router],
  );

  return (
    <EntityListWithCreateModal<MembershipMember>
      data={filtered}
      columns={columns}
      actions={[]}
      isLoading={isLoading}
      loadingText="Loading memberships..."
      emptyText="No memberships match your filters."
      error={
        error
          ? {
              message: "Failed to load memberships.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={result?.totalPages ?? pagination.getTotalPages(result?.total)}
      totalItems={result?.total ?? 0}
      onPageChange={pagination.setPage}
      showActionBar={false}
      addLabel="Register Membership"
      createTitle="Membership Registration"
      createSubmitText="Register"
      createLoadingText="Registering..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <RegisterMembershipForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
      rootClassName="rounded-[28px] border border-border bg-background/70 p-5 shadow-sm sm:p-8"
      renderPageHeader={({ openCreate }) => (
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
              Membership / Customer
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Membership List
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              Register members, manage wallet topup/refund, and bind or close cards.
            </p>
            {usingDemoData ? (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Showing demo memberships until live membership APIs return data.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted">
              {filtered.length} members
              {usingDemoData ? " · demo" : ""}
            </div>
            <Button
              type="button"
              onClick={openCreate}
              className="h-11 rounded-xl bg-mint px-5 text-gloss-black hover:bg-mint-hover"
              aria-label="Register membership"
              title="Register membership"
            >
              <UserPlus className="size-4" />
              Register
            </Button>
          </div>
        </div>
      )}
      topContent={
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-background/80 p-4 shadow-sm md:flex-row md:items-center">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, phone, email, or card..."
            className="h-11"
          />
          <div className="min-w-[200px]">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      }
      tablePanelClassName="rounded-2xl border border-border bg-background/80 shadow-sm"
      tableContentClassName="px-5 pb-5"
      tablePanelHeader={
        <div className="border-b border-border px-5 py-5">
          <h2 className="text-lg font-semibold text-foreground">Members</h2>
          <p className="mt-1 text-sm text-muted">
            Open a member to topup, refund, bind/unbind, or close the card.
          </p>
        </div>
      }
    />
  );
}
