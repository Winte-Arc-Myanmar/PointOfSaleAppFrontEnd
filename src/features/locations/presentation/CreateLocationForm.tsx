"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateLocation, useLocations } from "@/presentation/hooks/useLocations";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useToast } from "@/presentation/providers/ToastProvider";
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

const LOCATION_TYPES = [
  { value: "warehouse", label: "Warehouse" },
  { value: "store", label: "Store" },
  { value: "zone", label: "Zone" },
  { value: "bin", label: "Bin" },
  { value: "shelf", label: "Shelf" },
  { value: "other", label: "Other" },
] as const;

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  parentLocationId: z.string(),
  type: z.string().min(1, "Type is required"),
});

export type LocationFormData = z.infer<typeof schema>;

const defaultValues: LocationFormData = {
  name: "",
  tenantId: "",
  parentLocationId: PARENT_NONE,
  type: "warehouse",
};

export interface CreateLocationFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateLocationForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateLocationFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const createLocation = useCreateLocation();
  const toast = useToast();
  const { data: tenants = [] } = useTenants();
  const { data: allLocations = [], isLoading: isLocationsLoading } = useLocations({
    page: 1,
    limit: 200,
  });

  useEffect(() => {
    onLoadingChange?.(createLocation.isPending ?? false);
  }, [createLocation.isPending, onLoadingChange]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm<LocationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
  });

  const selectedTenantId = useWatch({ control, name: "tenantId" });

  const parentOptions = useMemo(
    () =>
      allLocations.filter((l) =>
        selectedTenantId ? l.tenantId === selectedTenantId : false
      ),
    [allLocations, selectedTenantId]
  );

  useEffect(() => {
    if (lockedTenantId) setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, setValue]);

  useEffect(() => {
    if (isLocationsLoading) return;
    const pid = getValues("parentLocationId");
    if (
      pid &&
      pid !== PARENT_NONE &&
      !parentOptions.some((l) => l.id === pid)
    ) {
      setValue("parentLocationId", PARENT_NONE);
    }
  }, [parentOptions, getValues, setValue, isLocationsLoading]);

  const onSubmit = (data: LocationFormData) => {
    createLocation.mutate(
      {
        name: data.name,
        tenantId: data.tenantId,
        type: data.type,
        parentLocationId:
          data.parentLocationId && data.parentLocationId !== PARENT_NONE
            ? data.parentLocationId
            : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Location created.");
          reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create location."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="loc-name">Name</Label>
        <Input
          id="loc-name"
          {...register("name")}
          placeholder="Main warehouse"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="loc-tenant">Tenant</Label>
        <Controller
          control={control}
          name="tenantId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!!lockedTenantId}
            >
              <SelectTrigger id="loc-tenant">
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
        {errors.tenantId && (
          <p className="text-sm text-red-600">{errors.tenantId.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="loc-parent">Parent location (optional)</Label>
        <Controller
          control={control}
          name="parentLocationId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!selectedTenantId || isLocationsLoading}
            >
              <SelectTrigger id="loc-parent">
                <SelectValue
                  placeholder={
                    isLocationsLoading ? "Loading..." : "None — top level"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PARENT_NONE}>None (top level)</SelectItem>
                {parentOptions.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="loc-type">Type</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="loc-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && (
          <p className="text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>
      {createLocation.isError && (
        <p className="text-sm text-red-600">Request failed. Check fields and try again.</p>
      )}
      {!formId && (
        <Button type="submit" disabled={createLocation.isPending}>
          {createLocation.isPending ? "Creating…" : "Create location"}
        </Button>
      )}
    </form>
  );
}
