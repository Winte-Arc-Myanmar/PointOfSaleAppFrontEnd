"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateUomClass } from "@/presentation/hooks/useUomClasses";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
});

export type UomClassFormData = z.infer<typeof schema>;

const defaultValues: UomClassFormData = {
  name: "",
  tenantId: "",
};

export interface CreateUomClassFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateUomClassForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateUomClassFormProps) {
  const createUomClass = useCreateUomClass();
  useEffect(() => {
    onLoadingChange?.(createUomClass.isPending ?? false);
  }, [createUomClass.isPending, onLoadingChange]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UomClassFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (data: UomClassFormData) => {
    createUomClass.mutate(
      { name: data.name, tenantId: data.tenantId },
      {
        onSuccess: () => {
          reset(defaultValues);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="e.g. Weight" />
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
      {createUomClass.isError && (
        <p className="text-sm text-red-600">
          Failed to create UOM class. Please try again.
        </p>
      )}
      {!formId && (
        <Button type="submit" disabled={createUomClass.isPending}>
          {createUomClass.isPending ? "Creating..." : "Create UOM Class"}
        </Button>
      )}
    </form>
  );
}
