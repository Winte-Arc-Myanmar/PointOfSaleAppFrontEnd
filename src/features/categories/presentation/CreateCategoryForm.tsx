"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCategory } from "@/presentation/hooks/useCategories";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useCategoryFormOptions } from "@/presentation/hooks/useCategoryFormOptions";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { Button } from "@/presentation/components/ui/button";
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
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  parentId: z.string(),
  description: z.string(),
  sortOrder: z.number().min(0),
});

export type CategoryFormData = z.infer<typeof schema>;

const defaultValues: CategoryFormData = {
  name: "",
  tenantId: "",
  parentId: PARENT_NONE,
  description: "",
  sortOrder: 0,
};

export interface CreateCategoryFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateCategoryForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateCategoryFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const createCategory = useCreateCategory();
  const toast = useToast();
  const { data: options, isLoading: isOptionsLoading } =
    useCategoryFormOptions();

  useEffect(() => {
    onLoadingChange?.(createCategory.isPending ?? false);
  }, [createCategory.isPending, onLoadingChange]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
  });

  const selectedTenantId = useWatch({ control, name: "tenantId" });

  const parentOptions = useMemo(
    () =>
      (options?.categories ?? []).filter((c) =>
        selectedTenantId ? c.tenantId === selectedTenantId : false
      ),
    [options?.categories, selectedTenantId]
  );

  useEffect(() => {
    if (lockedTenantId) setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, setValue]);

  useEffect(() => {
    if (isOptionsLoading) return;
    const parentId = getValues("parentId");
    if (
      parentId &&
      parentId !== PARENT_NONE &&
      !parentOptions.some((c) => c.id === parentId)
    ) {
      setValue("parentId", PARENT_NONE);
    }
  }, [parentOptions, getValues, setValue, isOptionsLoading]);

  const onSubmit = (data: CategoryFormData) => {
    createCategory.mutate(
      {
        name: data.name,
        tenantId: data.tenantId,
        parentId:
          !data.parentId || data.parentId === PARENT_NONE
            ? undefined
            : data.parentId,
        description: data.description || undefined,
        sortOrder: data.sortOrder,
      },
      {
        onSuccess: () => {
          toast.success("Category created.");
          reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create category."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="e.g. Electronics" />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tenantId">Tenant</Label>
          <Controller
            control={control}
            name="tenantId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => field.onChange(v)}
                disabled={isOptionsLoading || Boolean(lockedTenantId)}
              >
                <SelectTrigger id="tenantId">
                  <SelectValue
                    placeholder={
                      isOptionsLoading ? "Loading tenants..." : "Select tenant"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(options?.tenants ?? []).map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.tenantId && (
            <p className="text-sm text-red-600">{errors.tenantId.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="parentId">Parent category</Label>
          <Controller
            control={control}
            name="parentId"
            render={({ field }) => (
              <Select
                value={
                  field.value && field.value !== ""
                    ? field.value
                    : PARENT_NONE
                }
                onValueChange={field.onChange}
                disabled={isOptionsLoading || !selectedTenantId}
              >
                <SelectTrigger id="parentId">
                  <SelectValue
                    placeholder={
                      !selectedTenantId
                        ? "Select a tenant first"
                        : "None (root)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PARENT_NONE}>None (root)</SelectItem>
                  {parentOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
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
        <Input
          id="description"
          {...register("description")}
          placeholder="Optional description"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input
          id="sortOrder"
          type="number"
          {...register("sortOrder", { valueAsNumber: true })}
        />
        {errors.sortOrder && (
          <p className="text-sm text-red-600">{errors.sortOrder.message}</p>
        )}
      </div>
      {createCategory.isError && (
        <p className="text-sm text-red-600">
          Failed to create category. Please try again.
        </p>
      )}
      {!formId && (
        <Button type="submit" disabled={createCategory.isPending}>
          {createCategory.isPending ? "Creating..." : "Create Category"}
        </Button>
      )}
    </form>
  );
}
