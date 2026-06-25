"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateJournalEntry } from "@/presentation/hooks/useJournalEntries";
import { useAccountingPeriods } from "@/presentation/hooks/useAccountingPeriods";
import { useUsers } from "@/presentation/hooks/useUsers";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

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

const defaultValues: FormData = {
  tenantId: "",
  periodId: "",
  description: "",
  sourceModule: "",
  sourceRecordId: "",
  status: "DRAFT",
  postedBy: "",
};

export interface CreateJournalEntryFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateJournalEntryForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateJournalEntryFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateJournalEntry();
  const toast = useToast();
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

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });

  const filteredPeriods = useMemo(
    () => periods.filter((p) => (selectedTenantId ? p.tenantId === selectedTenantId : false)),
    [periods, selectedTenantId]
  );

  const filteredUsers = users;

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    const current = form.getValues("periodId");
    if (current && !filteredPeriods.some((p) => p.id === current)) {
      form.setValue("periodId", "");
    }
  }, [filteredPeriods, form]);

  useEffect(() => {
    const current = form.getValues("postedBy");
    if (current && !filteredUsers.some((u) => u.id === current)) {
      form.setValue("postedBy", "");
    }
  }, [filteredUsers, form]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        periodId: data.periodId,
        description: data.description.trim(),
        sourceModule: data.sourceModule.trim(),
        sourceRecordId: data.sourceRecordId.trim(),
        status: data.status,
        postedBy: data.postedBy,
      },
      {
        onSuccess: () => {
          toast.success("Journal entry created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create journal entry."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          {form.formState.errors.tenantId && (
            <p className="text-sm text-red-600">{form.formState.errors.tenantId.message}</p>
          )}
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
                  <SelectValue
                    placeholder={!selectedTenantId ? "Select tenant first" : "Select period"}
                  />
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
          {form.formState.errors.periodId && (
            <p className="text-sm text-red-600">{form.formState.errors.periodId.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          {...form.register("description")}
          placeholder="Monthly payroll entry"
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="sourceModule">Source module</Label>
          <Input id="sourceModule" {...form.register("sourceModule")} placeholder="payroll" />
          {form.formState.errors.sourceModule && (
            <p className="text-sm text-red-600">{form.formState.errors.sourceModule.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sourceRecordId">Source record ID</Label>
          <Input id="sourceRecordId" {...form.register("sourceRecordId")} placeholder="uuid" />
          {form.formState.errors.sourceRecordId && (
            <p className="text-sm text-red-600">{form.formState.errors.sourceRecordId.message}</p>
          )}
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
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedTenantId}
              >
                <SelectTrigger id="postedBy">
                  <SelectValue
                    placeholder={!selectedTenantId ? "Select tenant first" : "Select user"}
                  />
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
          {form.formState.errors.postedBy && (
            <p className="text-sm text-red-600">{form.formState.errors.postedBy.message}</p>
          )}
        </div>
      </div>
    </form>
  );
}
