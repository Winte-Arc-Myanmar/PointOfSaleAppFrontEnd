"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTableSession } from "@/presentation/hooks/useTableSessions";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useDiningZones } from "@/presentation/hooks/useDiningZones";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
import { useSections, useSectionAssignments } from "@/presentation/hooks/useSections";
import { useUsers } from "@/presentation/hooks/useUsers";
import { usePosRegisters } from "@/presentation/hooks/usePosRegisters";
import { usePosSessions } from "@/presentation/hooks/usePosSessions";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { Label } from "@/presentation/components/ui/label";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const LIST_LIMIT = 200;
const ALL_ZONES_VALUE = "__ALL_ZONES__";
const NO_SECTION_VALUE = "__NO_SECTION__";

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  locationId: z.string().min(1, "Location is required"),
  zoneId: z.string().optional(),
  tableId: z.string().min(1, "Dining table is required"),
  sectionId: z.string().optional(),
  guestCount: z.number().int().min(1, "Guest count must be at least 1"),
  waiterId: z.string().min(1, "Waiter is required"),
  posRegisterId: z.string().min(1, "POS register is required"),
  openedByPosSessionId: z.string().min(1, "POS session is required"),
  salesChannel: z.string().min(1, "Sales channel is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  locationId: "",
  zoneId: "",
  tableId: "",
  sectionId: "",
  guestCount: 1,
  waiterId: "",
  posRegisterId: "",
  openedByPosSessionId: "",
  salesChannel: "POS",
};

function getUserLabel(user: any): string {
  return user.fullName || user.username || user.email || String(user.id);
}

export interface CreateTableSessionFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateTableSessionForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateTableSessionFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateTableSession();
  const toast = useToast();

  const { data: tenantsData } = useTenants();
  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const { data: zonesData } = useDiningZones({ page: 1, limit: LIST_LIMIT, sortBy: "sortOrder", sortOrder: "asc" });
  const { data: tablesData } = useDiningTables({ page: 1, limit: LIST_LIMIT, sortBy: "tableNumber", sortOrder: "asc" });
  const { data: sectionsData } = useSections({ page: 1, limit: LIST_LIMIT, sortBy: "createdAt", sortOrder: "desc" });
  const { data: usersData } = useUsers({ page: 1, limit: LIST_LIMIT });
  const { data: registersData } = usePosRegisters({ page: 1, limit: LIST_LIMIT, sortBy: "createdAt", sortOrder: "desc" });
  const { data: posSessionsData } = usePosSessions({ page: 1, limit: LIST_LIMIT, sortBy: "createdAt", sortOrder: "desc" });

  const tenants = getPaginatedItems(tenantsData);
  const locations = getPaginatedItems(locationsData);
  const zones = getPaginatedItems(zonesData);
  const tables = getPaginatedItems(tablesData);
  const sections = getPaginatedItems(sectionsData);
  const users = getPaginatedItems(usersData);
  const registers = getPaginatedItems(registersData);
  const posSessions = getPaginatedItems(posSessionsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });
  const selectedLocationId = useWatch({ control: form.control, name: "locationId" });
  const selectedZoneId = useWatch({ control: form.control, name: "zoneId" });
  const selectedSectionId = useWatch({ control: form.control, name: "sectionId" });
  const { data: assignments = [] } = useSectionAssignments(selectedSectionId || null);

  const filteredLocations = useMemo(
    () => locations.filter((location) => (selectedTenantId ? location.tenantId === selectedTenantId : false)),
    [locations, selectedTenantId],
  );

  const filteredZones = useMemo(
    () => zones.filter((zone) => (selectedTenantId ? zone.tenantId === selectedTenantId : false)),
    [zones, selectedTenantId],
  );

  const filteredTables = useMemo(
    () => tables.filter((table) => (selectedZoneId ? table.zoneId === selectedZoneId : true)),
    [tables, selectedZoneId],
  );

  const filteredSections = useMemo(
    () =>
      sections.filter((section) =>
        selectedTenantId && selectedLocationId
          ? section.tenantId === selectedTenantId && section.locationId === selectedLocationId
          : false,
      ),
    [sections, selectedTenantId, selectedLocationId],
  );

  const waiterOptions = useMemo(() => {
    const assignedUserIds = new Set(
      assignments
        .filter((assignment) => !assignment.endsAt || new Date(assignment.endsAt).getTime() > Date.now())
        .map((assignment) => String(assignment.userId)),
    );
    if (selectedSectionId && assignedUserIds.size > 0) {
      return users.filter((user) => assignedUserIds.has(String(user.id)));
    }
    return users;
  }, [assignments, selectedSectionId, users]);

  const filteredRegisters = useMemo(
    () =>
      registers.filter((register) =>
        selectedTenantId
          ? register.tenantId === selectedTenantId &&
            (!selectedLocationId || register.locationId === selectedLocationId)
          : false,
      ),
    [registers, selectedTenantId, selectedLocationId],
  );

  const filteredPosSessions = useMemo(
    () =>
      posSessions.filter((session) =>
        selectedTenantId ? session.tenantId === selectedTenantId : false,
      ),
    [posSessions, selectedTenantId],
  );

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    const locationId = form.getValues("locationId");
    if (locationId && !filteredLocations.some((location) => String(location.id) === locationId)) {
      form.setValue("locationId", "");
    }
  }, [filteredLocations, form]);

  useEffect(() => {
    const zoneId = form.getValues("zoneId");
    if (zoneId && !filteredZones.some((zone) => String(zone.id) === zoneId)) {
      form.setValue("zoneId", "");
    }
  }, [filteredZones, form]);

  useEffect(() => {
    const tableId = form.getValues("tableId");
    if (tableId && !filteredTables.some((table) => String(table.id) === tableId)) {
      form.setValue("tableId", "");
    }
  }, [filteredTables, form]);

  useEffect(() => {
    const sectionId = form.getValues("sectionId");
    if (sectionId && !filteredSections.some((section) => String(section.id) === sectionId)) {
      form.setValue("sectionId", "");
    }
  }, [filteredSections, form]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        tableId: data.tableId,
        locationId: data.locationId,
        guestCount: data.guestCount,
        waiterId: data.waiterId,
        posRegisterId: data.posRegisterId,
        openedByPosSessionId: data.openedByPosSessionId,
        salesChannel: data.salesChannel,
      },
      {
        onSuccess: () => {
          toast.success("Table session opened.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to open table session."),
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
          <Label htmlFor="zoneId">Dining zone (optional filter)</Label>
          <Controller
            control={form.control}
            name="zoneId"
            render={({ field }) => (
              <Select
                value={field.value || ALL_ZONES_VALUE}
                onValueChange={(value) =>
                  field.onChange(value === ALL_ZONES_VALUE ? "" : value)
                }
              >
                <SelectTrigger id="zoneId">
                  <SelectValue placeholder="All zones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ZONES_VALUE}>All zones</SelectItem>
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
          <Label htmlFor="tableId">Dining table</Label>
          <Controller
            control={form.control}
            name="tableId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="tableId">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTables.map((table) => (
                    <SelectItem key={table.id} value={String(table.id)}>
                      {table.tableNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.tableId && (
            <p className="text-sm text-red-600">{form.formState.errors.tableId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="sectionId">Section (optional)</Label>
          <Controller
            control={form.control}
            name="sectionId"
            render={({ field }) => (
              <Select
                value={field.value || NO_SECTION_VALUE}
                onValueChange={(value) =>
                  field.onChange(value === NO_SECTION_VALUE ? "" : value)
                }
              >
                <SelectTrigger id="sectionId">
                  <SelectValue placeholder="No section filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SECTION_VALUE}>No section filter</SelectItem>
                  {filteredSections.map((section) => (
                    <SelectItem key={section.id} value={String(section.id)}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="waiterId">Waiter</Label>
          <Controller
            control={form.control}
            name="waiterId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="waiterId">
                  <SelectValue placeholder="Select waiter" />
                </SelectTrigger>
                <SelectContent>
                  {waiterOptions.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {getUserLabel(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.waiterId && (
            <p className="text-sm text-red-600">{form.formState.errors.waiterId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="guestCount">Guest count</Label>
          <Input
            id="guestCount"
            type="number"
            min={1}
            {...form.register("guestCount", { valueAsNumber: true })}
          />
          {form.formState.errors.guestCount && (
            <p className="text-sm text-red-600">{form.formState.errors.guestCount.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="salesChannel">Sales channel</Label>
          <Controller
            control={form.control}
            name="salesChannel"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="salesChannel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POS">POS</SelectItem>
                  <SelectItem value="ONLINE">ONLINE</SelectItem>
                  <SelectItem value="PHONE">PHONE</SelectItem>
                  <SelectItem value="OTHER">OTHER</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="posRegisterId">POS register</Label>
          <Controller
            control={form.control}
            name="posRegisterId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="posRegisterId">
                  <SelectValue placeholder="Select POS register" />
                </SelectTrigger>
                <SelectContent>
                  {filteredRegisters.map((register) => (
                    <SelectItem key={register.id} value={String(register.id)}>
                      {register.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.posRegisterId && (
            <p className="text-sm text-red-600">{form.formState.errors.posRegisterId.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="openedByPosSessionId">Opened by POS session</Label>
          <Controller
            control={form.control}
            name="openedByPosSessionId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="openedByPosSessionId">
                  <SelectValue placeholder="Select POS session" />
                </SelectTrigger>
                <SelectContent>
                  {filteredPosSessions.map((session) => (
                    <SelectItem key={session.id} value={String(session.id)}>
                      {String(session.id)} ({session.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.openedByPosSessionId && (
            <p className="text-sm text-red-600">
              {form.formState.errors.openedByPosSessionId.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
