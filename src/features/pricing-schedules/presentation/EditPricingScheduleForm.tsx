"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  usePricingSchedule,
  useUpdatePricingSchedule,
} from "@/presentation/hooks/usePricingSchedules";
import { useCategories } from "@/presentation/hooks/useCategories";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
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

const REDIRECT_DELAY_MS = 1200;
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

function toDatetimeLocalValue(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EditPricingScheduleForm({ scheduleId }: { scheduleId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdatePricingSchedule();
  const { data: schedule, isLoading, error } = usePricingSchedule(scheduleId);
  const { data: categoriesData } = useCategories({ page: 1, limit: 200 });
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = getPaginatedItems(categoriesData);
  const filteredCategories = schedule
    ? categories.filter((category) => category.tenantId === schedule.tenantId)
    : categories;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rules",
  });

  const selectedDays = form.watch("daysOfWeek");

  useEffect(() => {
    if (!schedule) return;
    form.reset({
      name: schedule.name,
      startsAt: toDatetimeLocalValue(schedule.startsAt),
      endsAt: toDatetimeLocalValue(schedule.endsAt),
      daysOfWeek: schedule.daysOfWeek.length ? schedule.daysOfWeek : [1, 2, 3, 4, 5],
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      priority: schedule.priority,
      isActive: schedule.isActive,
      rules:
        schedule.rules && schedule.rules.length > 0
          ? schedule.rules.map((rule) => ({
              variantId: rule.variantId ?? "",
              categoryId: rule.categoryId ?? "",
              adjustmentType: rule.adjustmentType as (typeof ADJUSTMENT_TYPES)[number],
              adjustmentValue: rule.adjustmentValue,
            }))
          : defaultValues.rules,
    });
  }, [schedule, form]);

  const toggleDay = (day: number) => {
    const current = form.getValues("daysOfWeek");
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort((a, b) => a - b);
    form.setValue("daysOfWeek", next, { shouldValidate: true });
  };

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: scheduleId,
        data: {
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
      },
      {
        onSuccess: () => {
          toast.success("Pricing schedule updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/pricing-schedules/${scheduleId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update pricing schedule."),
      },
    );
  };

  if (isLoading) {
    return <AppLoader fullScreen={false} size="sm" message="Loading pricing schedule..." />;
  }

  if (error || !schedule) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Pricing schedule not found.</p>
        <Link href="/pricing-schedules">
          <Button variant="outline">Back to Pricing Schedules</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/pricing-schedules/${scheduleId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit pricing schedule</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-3xl">
        <div className="grid gap-2">
          <Label>Tenant ID</Label>
          <Input value={schedule.tenantId} disabled className="font-mono" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="startsAt">Starts at</Label>
            <Input id="startsAt" type="datetime-local" {...form.register("startsAt")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endsAt">Ends at</Label>
            <Input id="endsAt" type="datetime-local" {...form.register("endsAt")} />
          </div>
        </div>

        <div className="grid gap-2">
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
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="startTime">Daily start time</Label>
            <Input id="startTime" type="time" {...form.register("startTime")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endTime">Daily end time</Label>
            <Input id="endTime" type="time" {...form.register("endTime")} />
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
        </div>

        {showSuccess && (
          <p className="text-sm font-medium text-green-600">
            Pricing schedule updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/pricing-schedules/${scheduleId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
