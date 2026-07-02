"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateSection } from "@/presentation/hooks/useSections";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useLocations } from "@/presentation/hooks/useLocations";
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

const LIST_LIMIT = 200;

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  locationId: z.string().min(1, "Location is required"),
  name: z.string().min(1, "Name is required"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Use a valid hex color like #FF5733"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  locationId: "",
  name: "",
  color: "#22C55E",
};

export interface CreateSectionFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateSectionForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateSectionFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateSection();
  const toast = useToast();
  const { data: tenantsData } = useTenants();
  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const tenants = getPaginatedItems(tenantsData);
  const locations = getPaginatedItems(locationsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });
  const colorValue = useWatch({ control: form.control, name: "color" });
  const filteredLocations = useMemo(
    () =>
      locations.filter((location) =>
        selectedTenantId ? location.tenantId === selectedTenantId : false
      ),
    [locations, selectedTenantId]
  );

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    const current = form.getValues("locationId");
    if (current && !filteredLocations.some((l) => String(l.id) === current)) {
      form.setValue("locationId", "");
    }
  }, [filteredLocations, form]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        locationId: data.locationId,
        name: data.name.trim(),
        color: data.color.toUpperCase(),
      },
      {
        onSuccess: () => {
          toast.success("Section created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create section."),
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
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
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
          <Label htmlFor="locationId">Location</Label>
          <Controller
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedTenantId}
              >
                <SelectTrigger id="locationId">
                  <SelectValue
                    placeholder={!selectedTenantId ? "Select tenant first" : "Select location"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredLocations.map((location) => (
                    <SelectItem key={location.id} value={String(location.id)}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.locationId && (
            <p className="text-sm text-red-600">{form.formState.errors.locationId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Section name</Label>
          <Input id="name" {...form.register("name")} placeholder="Section A" />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="color">Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="color"
              type="color"
              className="h-10 w-14 p-1"
              value={colorValue}
              onChange={(e) => form.setValue("color", e.target.value, { shouldDirty: true })}
            />
            <Input
              className="font-mono"
              maxLength={7}
              value={colorValue}
              onChange={(e) => form.setValue("color", e.target.value, { shouldDirty: true })}
            />
            <input type="hidden" {...form.register("color")} />
          </div>
          {form.formState.errors.color && (
            <p className="text-sm text-red-600">{form.formState.errors.color.message}</p>
          )}
        </div>
      </div>
    </form>
  );
}
