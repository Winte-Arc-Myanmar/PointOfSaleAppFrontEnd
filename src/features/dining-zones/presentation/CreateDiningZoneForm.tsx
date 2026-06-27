"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDiningZone } from "@/presentation/hooks/useDiningZones";
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
  DEFAULT_ZONE_SVG,
  FLOOR_PLAN_HEIGHT,
  FLOOR_PLAN_WIDTH,
  TEXTAREA_CLASS,
  ZONE_LAYOUT_PRESETS,
} from "@/features/dining/shared/dining-ui";
import { Button } from "@/presentation/components/ui/button";

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  name: z.string().min(1, "Name is required"),
  layoutSvg: z.string(),
  sortOrder: z
    .string()
    .min(1, "Sort order is required")
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 0;
    }, "Sort order must be a non-negative integer"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  name: "",
  layoutSvg: DEFAULT_ZONE_SVG,
  sortOrder: "0",
};

export interface CreateDiningZoneFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateDiningZoneForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateDiningZoneFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateDiningZone();
  const toast = useToast();
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
  });

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
        name: data.name.trim(),
        layoutSvg: data.layoutSvg.trim(),
        sortOrder: Number(data.sortOrder),
      },
      {
        onSuccess: () => {
          toast.success("Dining zone created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create dining zone."),
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
          <Label htmlFor="sortOrder">Display order</Label>
          <Input id="sortOrder" type="number" min={0} {...form.register("sortOrder")} />
          <p className="text-xs text-muted">Lower numbers appear first in the floor selector.</p>
          {form.formState.errors.sortOrder && (
            <p className="text-sm text-red-600">{form.formState.errors.sortOrder.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Zone name</Label>
        <Input id="name" {...form.register("name")} placeholder="Main Dining, Patio, Bar..." />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label>Floor layout template</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ZONE_LAYOUT_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="outline"
              size="sm"
              className="h-auto flex-col items-start gap-1 px-3 py-2 text-left"
              onClick={() => form.setValue("layoutSvg", preset.svg, { shouldDirty: true })}
            >
              <span className="font-medium text-foreground">{preset.label}</span>
              <span className="text-[11px] text-muted font-normal leading-tight">
                {preset.description}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="layoutSvg">Floor plan SVG</Label>
        <p className="text-xs text-muted">
          Background for the POS floor view ({FLOOR_PLAN_WIDTH}×{FLOOR_PLAN_HEIGHT}px). Tables are
          placed with X/Y coordinates on top of this canvas.
        </p>
        <textarea
          id="layoutSvg"
          {...form.register("layoutSvg")}
          rows={6}
          className={TEXTAREA_CLASS}
          placeholder="<svg>...</svg>"
        />
      </div>
    </form>
  );
}
