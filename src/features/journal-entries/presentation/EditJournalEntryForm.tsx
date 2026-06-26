"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useJournalEntry,
  useUpdateJournalEntry,
} from "@/presentation/hooks/useJournalEntries";
import { useAccountingPeriods } from "@/presentation/hooks/useAccountingPeriods";
import { useUsers } from "@/presentation/hooks/useUsers";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

const REDIRECT_DELAY_MS = 1500;
const ENTRY_STATUSES = ["DRAFT", "POSTED"] as const;
const LIST_LIMIT = 200;

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  periodId: z.string().min(1, "Accounting period is required"),
  description: z.string().min(1, "Description is required"),
  sourceModule: z.string().min(1, "Source module is required"),
  sourceRecordId: z.string().min(1, "Source record ID is required"),
  status: z.string().min(1, "Status is required"),
  postedBy: z.string().min(1, "Posted by is required"),
});

type FormData = z.infer<typeof schema>;

export function EditJournalEntryForm({ journalEntryId }: { journalEntryId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { tenantId: lockedTenantId } = usePermissions();
  const update = useUpdateJournalEntry();
  const { data: entry, isLoading, error } = useJournalEntry(journalEntryId);
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: periodsData } = useAccountingPeriods({
    page: 1,
    limit: LIST_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const periods = getPaginatedItems(periodsData);
  const { data: usersData } = useUsers({ page: 1, limit: LIST_LIMIT });
  const users = getPaginatedItems(usersData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      periodId: "",
      description: "",
      sourceModule: "",
      sourceRecordId: "",
      status: "DRAFT",
      postedBy: "",
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });

  const filteredPeriods = useMemo(
    () => periods.filter((p) => (selectedTenantId ? p.tenantId === selectedTenantId : false)),
    [periods, selectedTenantId]
  );

  const filteredUsers = users;

  useEffect(() => {
    if (entry) {
      form.reset({
        tenantId: entry.tenantId,
        periodId: entry.periodId,
        description: entry.description,
        sourceModule: entry.sourceModule,
        sourceRecordId: entry.sourceRecordId,
        status: entry.status,
        postedBy: entry.postedBy,
      });
    }
  }, [entry, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: journalEntryId,
        data: {
          tenantId: data.tenantId,
          periodId: data.periodId,
          description: data.description.trim(),
          sourceModule: data.sourceModule.trim(),
          sourceRecordId: data.sourceRecordId.trim(),
          status: data.status,
          postedBy: data.postedBy,
        },
      },
      {
        onSuccess: () => {
          toast.success("Journal entry updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/journal-entries/${journalEntryId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update journal entry."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !entry) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Journal entry not found.</p>
        <Link href="/journal-entries">
          <Button variant="outline">Back to Journal Entries</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/journal-entries/${journalEntryId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit journal entry</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tenantId">Tenant</Label>
            <Controller
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={Boolean(lockedTenantId)}
                >
                  <SelectTrigger id="tenantId">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="periodId">Accounting period</Label>
            <Controller
              control={form.control}
              name="periodId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedTenantId}
                >
                  <SelectTrigger id="periodId">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPeriods.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.periodName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" {...form.register("description")} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sourceModule">Source module</Label>
            <Input id="sourceModule" {...form.register("sourceModule")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sourceRecordId">Source record ID</Label>
            <Input id="sourceRecordId" {...form.register("sourceRecordId")} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTRY_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="postedBy">Posted by</Label>
            <Controller
              control={form.control}
              name="postedBy"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="postedBy">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.fullName || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Journal entry updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/journal-entries/${journalEntryId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
