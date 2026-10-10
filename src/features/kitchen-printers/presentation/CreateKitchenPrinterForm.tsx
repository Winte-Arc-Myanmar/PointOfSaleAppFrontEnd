"use client";

import { OutletSelect } from "@/features/locations/presentation/OutletSelect";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateKitchenPrinter } from "@/presentation/hooks/useKitchenPrinters";
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
import { PRINTER_SECTORS } from "@/core/domain/entities/KitchenPrinter";
import { PrinterSectorPicker } from "./PrinterSectorPicker";
import { ipAddressField, portField, toAddressPayload } from "./printer-address";

const LIST_LIMIT = 200;

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  locationId: z.string().min(1, "Location is required"),
  name: z.string().min(1, "Name is required"),
  ipAddress: ipAddressField,
  port: portField,
  sectors: z.array(z.enum(PRINTER_SECTORS)).min(1, "Pick at least one sector"),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  locationId: "",
  name: "",
  ipAddress: "",
  port: "",
  sectors: ["KDS"],
  isActive: true,
};

export interface CreateKitchenPrinterFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateKitchenPrinterForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateKitchenPrinterFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateKitchenPrinter();
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
        ...toAddressPayload(data.ipAddress, data.port),
        sectors: data.sectors,
        isActive: data.isActive,
      },
      {
        onSuccess: () => {
          toast.success("Printer created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create printer."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!lockedTenantId && (
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
        )}

        <div className="grid gap-2">
          <Label htmlFor="locationId">Outlet</Label>
          <Controller
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <OutletSelect tenantId={selectedTenantId} value={field.value} onChange={field.onChange} />
            )}
          />
          {form.formState.errors.locationId && (
            <p className="text-sm text-red-600">{form.formState.errors.locationId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Printer name</Label>
          <Input id="name" {...form.register("name")} placeholder="Hot Line Printer" />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="isActive">Status</Label>
          <Controller
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <Select
                value={field.value ? "true" : "false"}
                onValueChange={(value) => field.onChange(value === "true")}
              >
                <SelectTrigger id="isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="ipAddress">IP address (network printers only)</Label>
          <Input
            id="ipAddress"
            {...form.register("ipAddress")}
            placeholder="Leave empty for USB / Bluetooth"
            className="font-mono"
          />
          {form.formState.errors.ipAddress && (
            <p className="text-sm text-red-600">{form.formState.errors.ipAddress.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="port">Port</Label>
          <Input id="port" type="number" {...form.register("port")} placeholder="9100" />
          {form.formState.errors.port && (
            <p className="text-sm text-red-600">{form.formState.errors.port.message}</p>
          )}
        </div>
      </div>

      <Controller
        control={form.control}
        name="sectors"
        render={({ field }) => (
          <PrinterSectorPicker
            value={field.value}
            onChange={field.onChange}
            error={form.formState.errors.sectors?.message}
          />
        )}
      />
    </form>
  );
}
