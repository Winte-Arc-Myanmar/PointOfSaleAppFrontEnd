"use client";

import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePricingSchedule } from "@/presentation/hooks/usePricingSchedules";
import { useCategories } from "@/presentation/hooks/useCategories";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
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

const ADJUSTMENT_TYPES = ["PERCENT_OFF", "AMOUNT_OFF", "FIXED_PRICE"] as const;

const DAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const ruleSchema = z.object({
  variantId: z.string().optional(),
  categoryId: z.string().optional(),
  adjustmentType: z.enum(ADJUSTMENT_TYPES),
  adjustmentValue: z.number().gt(0, "Adjustment value must be greater than 0"),
});

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  name: z.string().min(1, "Name is required"),
  startsAt: z.string().min(1, "Start date is required"),
  endsAt: z.string().min(1, "End date is required"),
  daysOfWeek: z.array(z.number()).min(1, "Select at least one day"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  priority: z.number().int().min(0),
  isActive: z.boolean(),
  rules: z.array(ruleSchema).min(1, "At least one rule is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  name: "",
  startsAt: "",
  endsAt: "",
  daysOfWeek: [1, 2, 3, 4, 5],
  startTime: "17:00",
  endTime: "19:00",
  priority: 0,
  isActive: true,
  rules: [
    {
      variantId: "",
      categoryId: "",
      adjustmentType: "PERCENT_OFF",
      adjustmentValue: 10,
    },
  ],
};

function toIsoDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

export interface CreatePricingScheduleFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreatePricingScheduleForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreatePricingScheduleFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const toast = useToast();
  const create = useCreatePricingSchedule();

  const { data: tenantsData } = useTenants();
  const { data: categoriesData } = useCategories({ page: 1, limit: 200 });

  const tenants = getPaginatedItems(tenantsData);
  const categories = getPaginatedItems(categoriesData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rules",
  });

  const selectedDays = form.watch("daysOfWeek");
  const selectedTenantId = form.watch("tenantId");

  const filteredCategories = selectedTenantId
    ? categories.filter((category) => category.tenantId === selectedTenantId)
    : categories;

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const toggleDay = (day: number) => {
    const current = form.getValues("daysOfWeek");
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort((a, b) => a - b);
    form.setValue("daysOfWeek", next, { shouldValidate: true });
  };

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        name: data.name.trim(),
        startsAt: toIsoDateTime(data.startsAt),
        endsAt: toIsoDateTime(data.endsAt),
        daysOfWeek: data.daysOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        priority: data.priority,
        isActive: data.isActive,
        rules: data.rules.map((rule) => ({
          variantId: rule.variantId?.trim() || undefined,
          categoryId: rule.categoryId?.trim() || undefined,
          adjustmentType: rule.adjustmentType,
          adjustmentValue: rule.adjustmentValue,
        })),
      },
      {
        onSuccess: () => {
          toast.success("Pricing schedule created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create pricing schedule."),
      },
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Happy Hour" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="startsAt">Starts at</Label>
          <Input id="startsAt" type="datetime-local" {...form.register("startsAt")} />
          {form.formState.errors.startsAt && (
            <p className="text-sm text-red-600">{form.formState.errors.startsAt.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endsAt">Ends at</Label>
          <Input id="endsAt" type="datetime-local" {...form.register("endsAt")} />
          {form.formState.errors.endsAt && (
            <p className="text-sm text-red-600">{form.formState.errors.endsAt.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="grid gap-2 sm:col-span-2">
          <Label>Days of week</Label>
          <div className="flex flex-wrap gap-2">
            {DAY_OPTIONS.map((day) => {
              const checked = selectedDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    checked
                      ? "border-mint bg-mint/10 text-foreground"
                      : "border-border text-muted hover:border-mint/40"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
          {form.formState.errors.daysOfWeek && (
            <p className="text-sm text-red-600">{form.formState.errors.daysOfWeek.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            type="number"
            {...form.register("priority", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="startTime">Daily start time</Label>
          <Input id="startTime" type="time" {...form.register("startTime")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endTime">Daily end time</Label>
          <Input id="endTime" type="time" {...form.register("endTime")} />
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
        <input
          type="checkbox"
          className="h-4 w-4 accent-emerald-500"
          {...form.register("isActive")}
        />
        <span className="text-sm text-foreground">Active schedule</span>
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Pricing rules</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                variantId: "",
                categoryId: "",
                adjustmentType: "PERCENT_OFF",
                adjustmentValue: 10,
              })
            }
          >
            Add Rule
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-border p-3 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`variantId-${field.id}`}>Variant ID (optional)</Label>
                <Input
                  id={`variantId-${field.id}`}
                  placeholder="Variant UUID"
                  {...form.register(`rules.${index}.variantId`)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`categoryId-${field.id}`}>Category (optional)</Label>
                <Controller
                  control={form.control}
                  name={`rules.${index}.categoryId`}
                  render={({ field: categoryField }) => (
                    <Select
                      value={categoryField.value || "__none__"}
                      onValueChange={(value) =>
                        categoryField.onChange(value === "__none__" ? "" : value)
                      }
                    >
                      <SelectTrigger id={`categoryId-${field.id}`}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No category</SelectItem>
                        {filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`adjustmentType-${field.id}`}>Adjustment type</Label>
                <Controller
                  control={form.control}
                  name={`rules.${index}.adjustmentType`}
                  render={({ field: typeField }) => (
                    <Select value={typeField.value} onValueChange={typeField.onChange}>
                      <SelectTrigger id={`adjustmentType-${field.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ADJUSTMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`adjustmentValue-${field.id}`}>Adjustment value</Label>
                <Input
                  id={`adjustmentValue-${field.id}`}
                  type="number"
                  step="0.01"
                  {...form.register(`rules.${index}.adjustmentValue`, { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:text-red-700"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}

        {form.formState.errors.rules?.message && (
          <p className="text-sm text-red-600">{form.formState.errors.rules.message}</p>
        )}
      </div>
    </form>
  );
}
