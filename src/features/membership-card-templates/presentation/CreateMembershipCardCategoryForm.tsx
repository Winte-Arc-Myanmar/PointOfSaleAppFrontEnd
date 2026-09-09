"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useMembershipCardTemplateFormOptions } from "@/presentation/hooks/useMembershipCardTemplateFormOptions";
import { useCreateMembershipCardCategory } from "@/presentation/hooks/useMembershipCardCategories";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const PARENT_NONE = "__none__";

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  parentId: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  sortOrder: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  parentId: PARENT_NONE,
  name: "",
  description: "",
  sortOrder: 0,
};

export function CreateMembershipCardCategoryForm({
  formId,
  onSuccess,
  onLoadingChange,
}: {
  formId?: string;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const { tenantId: lockedTenantId } = usePermissions();
  const { data: options } = useMembershipCardTemplateFormOptions();
  const create = useCreateMembershipCardCategory();
  const toast = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues, tenantId: lockedTenantId ?? "" },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });
  const parentOptions = useMemo(
    () =>
      (options?.categories ?? []).filter((c) =>
        selectedTenantId ? c.tenantId === selectedTenantId : false,
      ),
    [options?.categories, selectedTenantId],
  );

  useEffect(() => {
    onLoadingChange?.(create.isPending);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const submit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        parentId: data.parentId === PARENT_NONE ? null : data.parentId,
        name: data.name.trim(),
        description: data.description.trim(),
        sortOrder: data.sortOrder,
      },
      {
        onSuccess: () => {
          toast.success("Card category created.");
          form.reset({ ...defaultValues, tenantId: lockedTenantId ?? form.getValues("tenantId") });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create card category."),
      },
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category-tenantId">Tenant</Label>
          <Controller
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={Boolean(lockedTenantId)}>
                <SelectTrigger id="category-tenantId"><SelectValue placeholder="Select tenant" /></SelectTrigger>
                <SelectContent>
                  {(options?.tenants ?? []).map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category-parentId">Parent category</Label>
          <Controller
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={!selectedTenantId}>
                <SelectTrigger id="category-parentId">
                  <SelectValue placeholder={!selectedTenantId ? "Select tenant first" : "None (root)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PARENT_NONE}>None (root)</SelectItem>
                  {parentOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category-name">Category name</Label>
        <Input id="category-name" {...form.register("name")} placeholder="e.g. Annual Cards" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category-description">Description</Label>
          <Input id="category-description" {...form.register("description")} placeholder="Optional description" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category-sortOrder">Sort order</Label>
          <Input id="category-sortOrder" type="number" {...form.register("sortOrder", { valueAsNumber: true })} />
        </div>
      </div>
    </form>
  );
}
