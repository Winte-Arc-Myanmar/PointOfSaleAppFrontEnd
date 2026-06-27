"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDiningZone, useUpdateDiningZone } from "@/presentation/hooks/useDiningZones";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";
import {
  FLOOR_PLAN_HEIGHT,
  FLOOR_PLAN_WIDTH,
  TEXTAREA_CLASS,
  ZONE_LAYOUT_PRESETS,
} from "@/features/dining/shared/dining-ui";

const REDIRECT_DELAY_MS = 1500;

const schema = z.object({
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

export function EditDiningZoneForm({ diningZoneId }: { diningZoneId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateDiningZone();
  const { data: zone, isLoading, error } = useDiningZone(diningZoneId);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      layoutSvg: "",
      sortOrder: "0",
    },
  });

  useEffect(() => {
    if (zone) {
      form.reset({
        name: zone.name,
        layoutSvg: zone.layoutSvg,
        sortOrder: String(zone.sortOrder),
      });
    }
  }, [zone, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: diningZoneId,
        data: {
          name: data.name.trim(),
          layoutSvg: data.layoutSvg.trim(),
          sortOrder: Number(data.sortOrder),
        },
      },
      {
        onSuccess: () => {
          toast.success("Dining zone updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/dining-zones/${diningZoneId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update dining zone."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !zone) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Dining zone not found.</p>
        <Link href="/dining-zones">
          <Button variant="outline">Back to Dining Zones</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dining-zones/${diningZoneId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit dining zone</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sortOrder">Display order</Label>
            <Input id="sortOrder" type="number" min={0} {...form.register("sortOrder")} />
            {form.formState.errors.sortOrder && (
              <p className="text-sm text-red-600">{form.formState.errors.sortOrder.message}</p>
            )}
          </div>
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
            Background for the POS floor view ({FLOOR_PLAN_WIDTH}×{FLOOR_PLAN_HEIGHT}px).
          </p>
          <textarea
            id="layoutSvg"
            {...form.register("layoutSvg")}
            rows={8}
            className={TEXTAREA_CLASS}
          />
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Dining zone updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/dining-zones/${diningZoneId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
