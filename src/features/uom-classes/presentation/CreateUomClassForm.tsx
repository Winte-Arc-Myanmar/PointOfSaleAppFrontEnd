"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateUomClass } from "@/presentation/hooks/useUomClasses";
import { useTenants } from "@/presentation/hooks/useTenants";
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

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant is required"),
});

export type UomClassFormData = z.infer<typeof schema>;

const defaultValues: UomClassFormData = {
  name: "",
  tenantId: "",
};

function defaultTenantValues(lockedTenantId: string | undefined) {
  return { ...defaultValues, tenantId: lockedTenantId ?? "" };
}

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
  const { tenantId: lockedTenantId } = usePermissions();
  const createUomClass = useCreateUomClass();
  const { data: tenants = [], isLoading: isTenantsLoading } = useTenants();

  useEffect(() => {
    onLoadingChange?.(createUomClass.isPending ?? false);
  }, [createUomClass.isPending, onLoadingChange]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UomClassFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultTenantValues(lockedTenantId),
  });

  useEffect(() => {
    if (lockedTenantId) setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, setValue]);

  const onSubmit = (data: UomClassFormData) => {
    createUomClass.mutate(
      { name: data.name, tenantId: data.tenantId },
      {
        onSuccess: () => {
          reset(defaultTenantValues(lockedTenantId));
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
        <Label htmlFor="tenantId">Tenant</Label>
        <Controller
          control={control}
          name="tenantId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isTenantsLoading || Boolean(lockedTenantId)}
            >
              <SelectTrigger id="tenantId">
                <SelectValue
                  placeholder={
                    isTenantsLoading ? "Loading tenants..." : "Select tenant"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
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
