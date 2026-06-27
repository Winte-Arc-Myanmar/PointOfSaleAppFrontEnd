"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDiningTable, useUpdateDiningTable, useDiningTables } from "@/presentation/hooks/useDiningTables";
import { useDiningZones, useDiningZone } from "@/presentation/hooks/useDiningZones";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";
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

const REDIRECT_DELAY_MS = 1500;
const LIST_LIMIT = 200;

const schema = z.object({
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

export function EditDiningTableForm({ diningTableId }: { diningTableId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateDiningTable();
  const { data: table, isLoading, error } = useDiningTable(diningTableId);
  const { data: zonesData } = useDiningZones({ page: 1, limit: LIST_LIMIT, sortBy: "sortOrder", sortOrder: "asc" });
  const zones = getPaginatedItems(zonesData);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredZones = useMemo(
    () => (table ? zones.filter((z) => z.tenantId === table.tenantId) : zones),
    [zones, table]
  );

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      zoneId: "",
      tableNumber: "",
      maxSeats: "4",
      posX: "0",
      posY: "0",
      shape: "RECTANGLE",
      status: "AVAILABLE",
    },
  });

  const zoneId = useWatch({ control: form.control, name: "zoneId" });
  const tableNumber = useWatch({ control: form.control, name: "tableNumber" });
  const maxSeats = useWatch({ control: form.control, name: "maxSeats" });
  const shape = useWatch({ control: form.control, name: "shape" });
  const status = useWatch({ control: form.control, name: "status" });
  const posX = useWatch({ control: form.control, name: "posX" });
  const posY = useWatch({ control: form.control, name: "posY" });

  const { data: selectedZone } = useDiningZone(zoneId || null);
  const { data: zoneTablesData } = useDiningTables({
    page: 1,
    limit: LIST_LIMIT,
    zoneId: zoneId || undefined,
  });
  const zoneTables = zoneTablesData?.items ?? [];

  useEffect(() => {
    if (table) {
      form.reset({
        zoneId: table.zoneId,
        tableNumber: table.tableNumber,
        maxSeats: String(table.maxSeats),
        posX: table.posX,
        posY: table.posY,
        shape:
          (TABLE_SHAPES as readonly string[]).includes(table.shape)
            ? (table.shape as (typeof TABLE_SHAPES)[number])
            : "RECTANGLE",
        status:
          (["AVAILABLE", "OCCUPIED", "DIRTY", "RESERVED"] as const).includes(
            table.status as "AVAILABLE" | "OCCUPIED" | "DIRTY" | "RESERVED"
          )
            ? (table.status as "AVAILABLE" | "OCCUPIED" | "DIRTY" | "RESERVED")
            : "AVAILABLE",
      });
    }
  }, [table, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: diningTableId,
        data: {
          zoneId: data.zoneId,
          tableNumber: data.tableNumber.trim(),
          maxSeats: Number(data.maxSeats),
          posX: Number(data.posX),
          posY: Number(data.posY),
          shape: data.shape,
          status: data.status,
        },
      },
      {
        onSuccess: () => {
          toast.success("Dining table updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/dining-tables/${diningTableId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update dining table."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !table) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Dining table not found.</p>
        <Link href="/dining-tables">
          <Button variant="outline">Back to Dining Tables</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dining-tables/${diningTableId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit dining table</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-4xl">
        <div className="grid gap-2">
          <Label htmlFor="zoneId">Dining zone</Label>
          <Controller
            control={form.control}
            name="zoneId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="zoneId">
                  <SelectValue placeholder="Select zone" />
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tableNumber">Table number</Label>
            <Input id="tableNumber" {...form.register("tableNumber")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxSeats">Max seats</Label>
            <Input id="maxSeats" type="number" min={1} {...form.register("maxSeats")} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Floor placement</Label>
          <FloorPlanPlacementEditor
            zone={selectedZone}
            posX={posX}
            posY={posY}
            existingTables={zoneTables}
            excludeTableId={diningTableId}
            preview={{
              tableNumber: tableNumber || table.tableNumber,
              maxSeats: Number(maxSeats) || table.maxSeats,
              shape,
              status,
            }}
            onPositionChange={(x, y) => {
              form.setValue("posX", String(x), { shouldDirty: true });
              form.setValue("posY", String(y), { shouldDirty: true });
            }}
          />
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

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Dining table updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/dining-tables/${diningTableId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
