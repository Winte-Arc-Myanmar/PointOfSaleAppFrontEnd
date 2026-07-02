"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useCategories } from "@/presentation/hooks/useCategories";
import { useKdsStation, useUpdateKdsStation } from "@/presentation/hooks/useKdsStations";
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
import { KdsCategoryRoutingPicker } from "./KdsCategoryRoutingPicker";

const REDIRECT_DELAY_MS = 1500;
const LIST_LIMIT = 200;

const schema = z.object({
  locationId: z.string().min(1, "Location is required"),
  name: z.string().min(1, "Name is required"),
  displayColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Use a valid hex color like #FF5733"),
  categoryIds: z.array(z.string()),
});

type FormData = z.infer<typeof schema>;

export function EditKdsStationForm({ stationId }: { stationId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateKdsStation();
  const { data: station, isLoading, error } = useKdsStation(stationId);
  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const { data: categoriesData } = useCategories({ page: 1, limit: LIST_LIMIT });
  const locations = getPaginatedItems(locationsData);
  const categories = getPaginatedItems(categoriesData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      locationId: "",
      name: "",
      displayColor: "#FF5733",
      categoryIds: [],
    },
  });

  const colorValue = useWatch({ control: form.control, name: "displayColor" });
  const categoryIds = useWatch({ control: form.control, name: "categoryIds" }) ?? [];

  const filteredLocations = useMemo(
    () => locations.filter((location) => (station ? location.tenantId === station.tenantId : true)),
    [locations, station],
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        id: String(category.id),
        name: category.name,
      })),
    [categories],
  );

  useEffect(() => {
    if (station) {
      form.reset({
        locationId: station.locationId,
        name: station.name,
        displayColor: station.displayColor || "#FF5733",
        categoryIds: station.routingRules.categoryIds,
      });
    }
  }, [station, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: stationId,
        data: {
          locationId: data.locationId,
          name: data.name.trim(),
          displayColor: data.displayColor.toUpperCase(),
          routingRules: { categoryIds: data.categoryIds },
        },
      },
      {
        onSuccess: () => {
          toast.success("KDS station updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/kds-stations/${stationId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update KDS station."),
      },
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !station) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">KDS station not found.</p>
        <Link href="/kds-stations">
          <Button variant="outline">Back to KDS Stations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/kds-stations/${stationId}`}>
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Edit KDS station</h1>
          <p className="text-sm text-muted">{station.name}</p>
        </div>
      </div>

      {showSuccess && (
        <p className="text-sm text-emerald-600">Saved. Redirecting to station details...</p>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="locationId">Location</Label>
            <Controller
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
            {form.formState.errors.locationId && (
              <p className="text-sm text-red-600">{form.formState.errors.locationId.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Station name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-2 max-w-xs">
          <Label htmlFor="displayColor">Display color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="displayColor"
              type="color"
              className="h-10 w-14 p-1"
              value={colorValue}
              onChange={(e) => form.setValue("displayColor", e.target.value, { shouldDirty: true })}
            />
            <Input
              className="font-mono"
              maxLength={7}
              value={colorValue}
              onChange={(e) => form.setValue("displayColor", e.target.value, { shouldDirty: true })}
            />
            <input type="hidden" {...form.register("displayColor")} />
          </div>
          {form.formState.errors.displayColor && (
            <p className="text-sm text-red-600">{form.formState.errors.displayColor.message}</p>
          )}
        </div>

        <KdsCategoryRoutingPicker
          categories={categoryOptions}
          value={categoryIds}
          onChange={(ids) => form.setValue("categoryIds", ids, { shouldDirty: true })}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/kds-stations/${stationId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
