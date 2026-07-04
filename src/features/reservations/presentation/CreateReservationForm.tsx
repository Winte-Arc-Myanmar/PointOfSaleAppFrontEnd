"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateReservation } from "@/presentation/hooks/useReservations";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useCustomers } from "@/presentation/hooks/useCustomers";
import { useDiningZones } from "@/presentation/hooks/useDiningZones";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
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
const NONE = "__none__";

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  locationId: z.string().min(1, "Location is required"),
  customerId: z.string().optional(),
  guestName: z.string().min(1, "Guest name is required"),
  guestPhone: z.string().optional(),
  guestEmail: z.string().email("Invalid email").or(z.literal("")).optional(),
  partySize: z.number().int().min(1, "Party size must be at least 1"),
  reservedAt: z.string().min(1, "Reserved date/time is required"),
  estimatedDurationMins: z.number().int().min(1).optional(),
  preferredZoneId: z.string().optional(),
  assignedTableId: z.string().optional(),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  locationId: "",
  customerId: "",
  guestName: "",
  guestPhone: "",
  guestEmail: "",
  partySize: 2,
  reservedAt: "",
  estimatedDurationMins: 90,
  preferredZoneId: "",
  assignedTableId: "",
  specialRequests: "",
  notes: "",
};

export function CreateReservationForm({
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
  const create = useCreateReservation();

  const { data: tenantsData } = useTenants();
  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const { data: customersData } = useCustomers({ page: 1, limit: LIST_LIMIT });
  const { data: zonesData } = useDiningZones({ page: 1, limit: LIST_LIMIT });
  const { data: tablesData } = useDiningTables({ page: 1, limit: LIST_LIMIT });

  const tenants = getPaginatedItems(tenantsData);
  const locations = getPaginatedItems(locationsData);
  const customers = getPaginatedItems(customersData);
  const zones = getPaginatedItems(zonesData);
  const tables = getPaginatedItems(tablesData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues, tenantId: lockedTenantId ?? "" },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });
  const selectedZoneId = useWatch({ control: form.control, name: "preferredZoneId" });

  const filteredLocations = useMemo(
    () => locations.filter((x) => (selectedTenantId ? x.tenantId === selectedTenantId : false)),
    [locations, selectedTenantId],
  );
  const filteredZones = useMemo(
    () => zones.filter((x) => (selectedTenantId ? x.tenantId === selectedTenantId : false)),
    [selectedTenantId, zones],
  );
  const filteredTables = useMemo(
    () =>
      tables.filter((x) => {
        if (!selectedTenantId) return false;
        const inTenant = x.tenantId === selectedTenantId;
        const inZone = selectedZoneId ? String(x.zoneId ?? "") === selectedZoneId : true;
        return inTenant && inZone;
      }),
    [selectedTenantId, selectedZoneId, tables],
  );

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const submit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        locationId: data.locationId,
        customerId: data.customerId?.trim() || undefined,
        guestName: data.guestName.trim(),
        guestPhone: data.guestPhone?.trim() || undefined,
        guestEmail: data.guestEmail?.trim() || undefined,
        partySize: data.partySize,
        reservedAt: new Date(data.reservedAt).toISOString(),
        estimatedDurationMins: data.estimatedDurationMins || undefined,
        preferredZoneId: data.preferredZoneId?.trim() || undefined,
        assignedTableId: data.assignedTableId?.trim() || undefined,
        specialRequests: data.specialRequests?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Reservation created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create reservation."),
      },
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(submit)} className="space-y-4">
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
          <Label htmlFor="guestName">Guest name</Label>
          <Input id="guestName" {...form.register("guestName")} placeholder="Jane Doe" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="customerId">Customer (optional)</Label>
          <Controller
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <Select value={field.value || NONE} onValueChange={(value) => field.onChange(value === NONE ? "" : value)}>
                <SelectTrigger id="customerId">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No linked customer</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={String(customer.id)}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="reservedAt">Reserved at</Label>
          <Input id="reservedAt" type="datetime-local" {...form.register("reservedAt")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="partySize">Party size</Label>
          <Input id="partySize" type="number" {...form.register("partySize", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="estimatedDurationMins">Duration (mins)</Label>
          <Input
            id="estimatedDurationMins"
            type="number"
            {...form.register("estimatedDurationMins", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="preferredZoneId">Preferred zone</Label>
          <Controller
            control={form.control}
            name="preferredZoneId"
            render={({ field }) => (
              <Select value={field.value || NONE} onValueChange={(value) => field.onChange(value === NONE ? "" : value)}>
                <SelectTrigger id="preferredZoneId">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No preference</SelectItem>
                  {filteredZones.map((zone) => (
                    <SelectItem key={zone.id} value={String(zone.id)}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="assignedTableId">Assigned table</Label>
          <Controller
            control={form.control}
            name="assignedTableId"
            render={({ field }) => (
              <Select value={field.value || NONE} onValueChange={(value) => field.onChange(value === NONE ? "" : value)}>
                <SelectTrigger id="assignedTableId">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Not assigned</SelectItem>
                  {filteredTables.map((table) => (
                    <SelectItem key={table.id} value={String(table.id)}>
                      {table.tableNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="guestPhone">Guest phone</Label>
          <Input id="guestPhone" {...form.register("guestPhone")} placeholder="+1-555-0100" />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="guestEmail">Guest email</Label>
          <Input id="guestEmail" type="email" {...form.register("guestEmail")} placeholder="jane@example.com" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="specialRequests">Special requests</Label>
        <textarea
          id="specialRequests"
          {...form.register("specialRequests")}
          className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
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
