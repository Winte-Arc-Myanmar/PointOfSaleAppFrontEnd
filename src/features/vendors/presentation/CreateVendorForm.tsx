"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateVendor } from "@/presentation/hooks/useVendors";
import { useToast } from "@/presentation/providers/ToastProvider";
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

export type VendorFormData = z.infer<typeof schema>;

const defaultValues: VendorFormData = {
  name: "",
  tenantId: "",
};

function defaultTenantValues(lockedTenantId: string | undefined) {
  return { ...defaultValues, tenantId: lockedTenantId ?? "" };
}

export interface CreateVendorFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateVendorForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateVendorFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const createVendor = useCreateVendor();
  const toast = useToast();
  const { data: tenants = [], isLoading: isTenantsLoading } = useTenants();

  useEffect(() => {
    onLoadingChange?.(createVendor.isPending ?? false);
  }, [createVendor.isPending, onLoadingChange]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<VendorFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultTenantValues(lockedTenantId),
  });

  useEffect(() => {
    if (lockedTenantId) setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, setValue]);

  const onSubmit = (data: VendorFormData) => {
    createVendor.mutate(
      { name: data.name, tenantId: data.tenantId },
      {
        onSuccess: () => {
          toast.success("Vendor created.");
          reset(defaultTenantValues(lockedTenantId));
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create vendor."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="e.g. Acme Supplies" />
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
      {createVendor.isError && (
        <p className="text-sm text-red-600">
          Failed to create vendor. Please try again.
        </p>
      )}
      {!formId && (
        <Button type="submit" disabled={createVendor.isPending}>
          {createVendor.isPending ? "Creating..." : "Create Vendor"}
        </Button>
      )}
    </form>
  );
}

