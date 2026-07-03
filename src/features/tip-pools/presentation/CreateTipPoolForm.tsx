"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTipPool } from "@/presentation/hooks/useTipPools";
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
const DISTRIBUTION_METHODS = ["EQUAL", "BY_HOURS", "MANUAL"] as const;

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  locationId: z.string().min(1, "Location is required"),
  name: z.string().min(1, "Name is required"),
  periodStart: z.string().min(1, "Period start is required"),
  periodEnd: z.string().min(1, "Period end is required"),
  distributionMethod: z.string().min(1, "Distribution method is required"),
  includeServiceCharge: z.boolean(),
  serviceChargeShareBps: z.number().int().min(0).max(10000),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  locationId: "",
  name: "",
  periodStart: "",
  periodEnd: "",
  distributionMethod: "BY_HOURS",
  includeServiceCharge: false,
  serviceChargeShareBps: 0,
  notes: "",
};

export function CreateTipPoolForm({
  onSuccess,
  formId,
  onLoadingChange,
}: {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const { tenantId: lockedTenantId } = usePermissions();
  const toast = useToast();
  const create = useCreateTipPool();

  const { data: tenantsData } = useTenants();
  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const tenants = getPaginatedItems(tenantsData);
  const locations = getPaginatedItems(locationsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues, tenantId: lockedTenantId ?? "" },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });

  const filteredLocations = useMemo(
    () => locations.filter((location) => (selectedTenantId ? location.tenantId === selectedTenantId : false)),
    [locations, selectedTenantId],
  );

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        locationId: data.locationId,
        name: data.name.trim(),
        periodStart: new Date(data.periodStart).toISOString(),
        periodEnd: new Date(data.periodEnd).toISOString(),
        distributionMethod: data.distributionMethod,
        includeServiceCharge: data.includeServiceCharge,
        serviceChargeShareBps: data.serviceChargeShareBps,
        notes: data.notes?.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Tip pool created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create tip pool."),
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
              <Select value={field.value} onValueChange={field.onChange} disabled={Boolean(lockedTenantId)}>
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
        </div>
        <div className="grid gap-2">
          <Label htmlFor="locationId">Location</Label>
          <Controller
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={!selectedTenantId}>
                <SelectTrigger id="locationId">
                  <SelectValue placeholder="Select location" />
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
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Pool name</Label>
          <Input id="name" {...form.register("name")} placeholder="Friday Dinner Pool" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="distributionMethod">Distribution method</Label>
          <Controller
            control={form.control}
            name="distributionMethod"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="distributionMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISTRIBUTION_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="periodStart">Period start</Label>
          <Input id="periodStart" type="datetime-local" {...form.register("periodStart")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="periodEnd">Period end</Label>
          <Input id="periodEnd" type="datetime-local" {...form.register("periodEnd")} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="includeServiceCharge">Include service charge</Label>
          <Controller
            control={form.control}
            name="includeServiceCharge"
            render={({ field }) => (
              <Select
                value={field.value ? "true" : "false"}
                onValueChange={(value) => field.onChange(value === "true")}
              >
                <SelectTrigger id="includeServiceCharge">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="serviceChargeShareBps">Service charge share (bps)</Label>
          <Input
            id="serviceChargeShareBps"
            type="number"
            {...form.register("serviceChargeShareBps", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          {...form.register("notes")}
          className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </form>
  );
}
