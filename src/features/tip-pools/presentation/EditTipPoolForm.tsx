"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTipPool, useUpdateTipPool } from "@/presentation/hooks/useTipPools";
import { useLocations } from "@/presentation/hooks/useLocations";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
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
const LIST_LIMIT = 200;
const DISTRIBUTION_METHODS = ["EQUAL", "BY_HOURS", "MANUAL"] as const;

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  periodStart: z.string().min(1, "Period start is required"),
  periodEnd: z.string().min(1, "Period end is required"),
  distributionMethod: z.string().min(1, "Distribution method is required"),
  includeServiceCharge: z.boolean(),
  serviceChargeShareBps: z.number().int().min(0).max(10000),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function EditTipPoolForm({ poolId }: { poolId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateTipPool();
  const { data: pool, isLoading, error } = useTipPool(poolId);
  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const locations = getPaginatedItems(locationsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      periodStart: "",
      periodEnd: "",
      distributionMethod: "BY_HOURS",
      includeServiceCharge: false,
      serviceChargeShareBps: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (!pool) return;
    form.reset({
      name: pool.name,
      periodStart: pool.periodStart ? new Date(pool.periodStart).toISOString().slice(0, 16) : "",
      periodEnd: pool.periodEnd ? new Date(pool.periodEnd).toISOString().slice(0, 16) : "",
      distributionMethod: pool.distributionMethod,
      includeServiceCharge: pool.includeServiceCharge,
      serviceChargeShareBps: pool.serviceChargeShareBps,
      notes: pool.notes ?? "",
    });
  }, [pool, form]);

  const locationName = useMemo(
    () => (pool ? locations.find((x) => String(x.id) === String(pool.locationId))?.name : ""),
    [locations, pool],
  );

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: poolId,
        data: {
          name: data.name.trim(),
          periodStart: new Date(data.periodStart).toISOString(),
          periodEnd: new Date(data.periodEnd).toISOString(),
          distributionMethod: data.distributionMethod,
          includeServiceCharge: data.includeServiceCharge,
          serviceChargeShareBps: data.serviceChargeShareBps,
          notes: data.notes?.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Tip pool updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/tip-pools/${poolId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update tip pool."),
      },
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !pool) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Tip pool not found.</p>
        <Link href="/tip-pools">
          <Button variant="outline">Back to Tip Pools</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/tip-pools/${poolId}`}>
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Edit tip pool</h1>
          <p className="text-sm text-muted">{pool.name}</p>
        </div>
      </div>

      {showSuccess && <p className="text-sm text-emerald-600">Saved. Redirecting...</p>}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-3xl">
        <div className="grid gap-2">
          <Label>Location</Label>
          <Input value={locationName || pool.locationId} disabled />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Pool name</Label>
            <Input id="name" {...form.register("name")} />
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

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/tip-pools/${poolId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
