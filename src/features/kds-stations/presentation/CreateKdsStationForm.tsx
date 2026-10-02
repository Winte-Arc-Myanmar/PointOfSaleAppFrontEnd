"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateKdsStation } from "@/presentation/hooks/useKdsStations";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useCategories } from "@/presentation/hooks/useCategories";
import { useKitchenPrinters } from "@/presentation/hooks/useKitchenPrinters";
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
import { KdsCategoryRoutingPicker } from "./KdsCategoryRoutingPicker";
import { PrinterChecklist } from "@/features/kitchen-printers/presentation/PrinterChecklist";
import { printersFor } from "@/features/kitchen-printers/presentation/printers-for";

const LIST_LIMIT = 200;
const NO_PRINTERS: string[] = [];

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  locationId: z.string().min(1, "Location is required"),
  name: z.string().min(1, "Name is required"),
  displayColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Use a valid hex color like #FF5733"),
  categoryIds: z.array(z.string()),
  printerIds: z.array(z.string()),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  locationId: "",
  name: "",
  displayColor: "#FF5733",
  categoryIds: [],
  printerIds: [],
};

export interface CreateKdsStationFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateKdsStationForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateKdsStationFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateKdsStation();
  const toast = useToast();
  const { data: tenantsData } = useTenants();
  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const { data: categoriesData } = useCategories({ page: 1, limit: LIST_LIMIT });
  const tenants = getPaginatedItems(tenantsData);
  const locations = getPaginatedItems(locationsData);
  const categories = getPaginatedItems(categoriesData);
  const { data: printersData } = useKitchenPrinters({ page: 1, limit: LIST_LIMIT });
  const printers = getPaginatedItems(printersData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });
  const colorValue = useWatch({ control: form.control, name: "displayColor" });
  const categoryIds = useWatch({ control: form.control, name: "categoryIds" }) ?? [];
  const printerIds = useWatch({ control: form.control, name: "printerIds" }) ?? NO_PRINTERS;
  const selectedLocationId = useWatch({ control: form.control, name: "locationId" });

  const filteredLocations = useMemo(
    () =>
      locations.filter((location) =>
        selectedTenantId ? location.tenantId === selectedTenantId : false,
      ),
    [locations, selectedTenantId],
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        id: String(category.id),
        name: category.name,
      })),
    [categories],
  );

  const printerOptions = useMemo(
    () => printersFor(printers, "KDS", selectedLocationId, printerIds),
    [printers, printerIds, selectedLocationId],
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
        displayColor: data.displayColor.toUpperCase(),
        routingRules: { categoryIds: data.categoryIds },
        printerIds: data.printerIds,
      },
      {
        onSuccess: () => {
          toast.success("KDS station created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create KDS station."),
      },
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
                    <SelectItem key={tenant.id} value={String(tenant.id)}>
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
          <Label htmlFor="name">Station name</Label>
          <Input id="name" {...form.register("name")} placeholder="Hot line" />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="displayColor">Display color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="displayColor"
              type="color"
              className="h-10 w-14 p-1"
              value={colorValue}
              onChange={(e) => form.setValue("displayColor", e.target.value, { shouldDirty: true })}
            />
            <Input
              className="font-mono"
              maxLength={7}
              value={colorValue}
              onChange={(e) => form.setValue("displayColor", e.target.value, { shouldDirty: true })}
            />
            <input type="hidden" {...form.register("displayColor")} />
          </div>
          {form.formState.errors.displayColor && (
            <p className="text-sm text-red-600">{form.formState.errors.displayColor.message}</p>
          )}
        </div>
      </div>

      <KdsCategoryRoutingPicker
        categories={categoryOptions}
        value={categoryIds}
        onChange={(ids) => form.setValue("categoryIds", ids, { shouldDirty: true })}
      />

      <PrinterChecklist
        label="Printers"
        hint="Tickets for this station go to every printer picked here, e.g. two printers, or a printer and an LED board. Leave empty for a screen-only station."
        emptyText="No KDS printers at this location."
        printers={printerOptions}
        value={printerIds}
        onChange={(ids) => form.setValue("printerIds", ids, { shouldDirty: true })}
        locationSelected={Boolean(selectedLocationId)}
      />
    </form>
  );
}
