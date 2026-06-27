"use client";

import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDiningTable } from "@/presentation/hooks/useDiningTables";
import { useDiningZones, useDiningZone } from "@/presentation/hooks/useDiningZones";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
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
import {
  getStatusConfig,
  SHAPE_LABELS,
  TABLE_SHAPES,
  TABLE_STATUSES,
} from "@/features/dining/shared/dining-ui";
import { FloorPlanPlacementEditor } from "@/features/dining/shared/FloorPlanPlacementEditor";
import {
  hasFloorPosition,
  parseCoord,
  suggestNextPosition,
} from "@/features/dining/shared/floor-plan-utils";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";

const LIST_LIMIT = 200;

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  zoneId: z.string().min(1, "Zone is required"),
  tableNumber: z.string().min(1, "Table number is required"),
  maxSeats: z
    .string()
    .min(1, "Max seats is required")
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1;
    }, "Max seats must be at least 1"),
  posX: z.string().min(1, "X position is required"),
  posY: z.string().min(1, "Y position is required"),
  shape: z.enum(TABLE_SHAPES),
  status: z.enum(["AVAILABLE", "OCCUPIED", "DIRTY", "RESERVED"]),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  zoneId: "",
  tableNumber: "",
  maxSeats: "4",
  posX: "0",
  posY: "0",
  shape: "RECTANGLE",
  status: "AVAILABLE",
};

export interface CreateDiningTableFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
  defaultZoneId?: string;
}

export function CreateDiningTableForm({
  onSuccess,
  formId,
  onLoadingChange,
  defaultZoneId,
}: CreateDiningTableFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateDiningTable();
  const toast = useToast();
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: zonesData } = useDiningZones({ page: 1, limit: LIST_LIMIT, sortBy: "sortOrder", sortOrder: "asc" });
  const zones = getPaginatedItems(zonesData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
      zoneId: defaultZoneId ?? "",
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });
  const selectedZoneId = useWatch({ control: form.control, name: "zoneId" });
  const tableNumber = useWatch({ control: form.control, name: "tableNumber" });
  const maxSeats = useWatch({ control: form.control, name: "maxSeats" });
  const shape = useWatch({ control: form.control, name: "shape" });
  const status = useWatch({ control: form.control, name: "status" });
  const posX = useWatch({ control: form.control, name: "posX" });
  const posY = useWatch({ control: form.control, name: "posY" });

  const { data: selectedZone } = useDiningZone(selectedZoneId || null);
  const { data: zoneTablesData } = useDiningTables({
    page: 1,
    limit: LIST_LIMIT,
    zoneId: selectedZoneId || undefined,
  });
  const zoneTables = zoneTablesData?.items ?? [];
  const lastZoneRef = useRef<string>("");

  const filteredZones = useMemo(
    () => zones.filter((z) => (selectedTenantId ? z.tenantId === selectedTenantId : false)),
    [zones, selectedTenantId]
  );

  useEffect(() => {
    if (!selectedZoneId) return;
    const occupied = zoneTables
      .map((t) => ({ x: parseCoord(t.posX), y: parseCoord(t.posY) }))
      .filter((p) => hasFloorPosition(p.x, p.y));
    const next = suggestNextPosition(occupied);
    const currentX = parseCoord(form.getValues("posX"));
    const currentY = parseCoord(form.getValues("posY"));
    const zoneChanged = selectedZoneId !== lastZoneRef.current;
    if (zoneChanged) {
      lastZoneRef.current = selectedZoneId;
      form.setValue("posX", String(next.x));
      form.setValue("posY", String(next.y));
    } else if (!hasFloorPosition(currentX, currentY)) {
      form.setValue("posX", String(next.x));
      form.setValue("posY", String(next.y));
    }
  }, [selectedZoneId, zoneTables, form]);

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    if (defaultZoneId) form.setValue("zoneId", defaultZoneId);
  }, [defaultZoneId, form]);

  useEffect(() => {
    const current = form.getValues("zoneId");
    if (current && !filteredZones.some((z) => String(z.id) === current)) {
      form.setValue("zoneId", "");
    }
  }, [filteredZones, form]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        zoneId: data.zoneId,
        tableNumber: data.tableNumber.trim(),
        maxSeats: Number(data.maxSeats),
        posX: Number(data.posX),
        posY: Number(data.posY),
        shape: data.shape,
        status: data.status,
      },
      {
        onSuccess: () => {
          toast.success("Dining table created.");
          lastZoneRef.current = "";
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
            zoneId: defaultZoneId ?? "",
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create dining table."),
      }
    );
  };

  const zoneDisabled = !selectedTenantId;

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
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
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
          <Label htmlFor="zoneId">Dining zone</Label>
          <Controller
            control={form.control}
            name="zoneId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={zoneDisabled}
              >
                <SelectTrigger id="zoneId">
                  <SelectValue
                    placeholder={zoneDisabled ? "Select tenant first" : "Select zone"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredZones.map((z) => (
                    <SelectItem key={z.id} value={String(z.id)}>
                      {z.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.zoneId && (
            <p className="text-sm text-red-600">{form.formState.errors.zoneId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tableNumber">Table number</Label>
          <Input id="tableNumber" {...form.register("tableNumber")} placeholder="T-12" />
          {form.formState.errors.tableNumber && (
            <p className="text-sm text-red-600">{form.formState.errors.tableNumber.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="maxSeats">Max seats</Label>
          <Input id="maxSeats" type="number" min={1} {...form.register("maxSeats")} />
          {form.formState.errors.maxSeats && (
            <p className="text-sm text-red-600">{form.formState.errors.maxSeats.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Floor placement</Label>
        {selectedZoneId ? (
          <FloorPlanPlacementEditor
            zone={selectedZone}
            posX={posX}
            posY={posY}
            existingTables={zoneTables}
            preview={{
              tableNumber: tableNumber || "New",
              maxSeats: Number(maxSeats) || 4,
              shape,
              status,
            }}
            onPositionChange={(x, y) => {
              form.setValue("posX", String(x), { shouldDirty: true });
              form.setValue("posY", String(y), { shouldDirty: true });
            }}
          />
        ) : (
          <p className="text-sm text-muted rounded-lg border border-dashed border-border px-4 py-8 text-center">
            Select a dining zone first to place the table on the floor.
          </p>
        )}
        <input type="hidden" {...form.register("posX")} />
        <input type="hidden" {...form.register("posY")} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="shape">Shape</Label>
          <Controller
            control={form.control}
            name="shape"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="shape">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TABLE_SHAPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SHAPE_LABELS[s] ?? s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TABLE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {getStatusConfig(s).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </form>
  );
}
