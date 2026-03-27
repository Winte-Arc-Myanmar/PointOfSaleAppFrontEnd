"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCategory } from "@/presentation/hooks/useCategories";
import { useCategories } from "@/presentation/hooks/useCategories";
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

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
  parentId: z.string(),
  description: z.string(),
  sortOrder: z.number().min(0),
});

export type CategoryFormData = z.infer<typeof schema>;

const defaultValues: CategoryFormData = {
  name: "",
  tenantId: "",
  parentId: "",
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
  const createCategory = useCreateCategory();
  const { data: categories = [] } = useCategories();

  useEffect(() => {
    onLoadingChange?.(createCategory.isPending ?? false);
  }, [createCategory.isPending, onLoadingChange]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (data: CategoryFormData) => {
    createCategory.mutate(
      {
        name: data.name,
        tenantId: data.tenantId,
        parentId: !data.parentId || data.parentId === "__none__" ? undefined : data.parentId,
        description: data.description || undefined,
        sortOrder: data.sortOrder,
      },
      {
        onSuccess: () => {
          reset(defaultValues);
          onSuccess?.();
        },
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
      <div className="grid gap-2">
        <Label htmlFor="tenantId">Tenant ID</Label>
        <Input
          id="tenantId"
          {...register("tenantId")}
          placeholder="UUID of the tenant"
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
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="parentId">
                <SelectValue placeholder="None (root)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None (root)</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
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
