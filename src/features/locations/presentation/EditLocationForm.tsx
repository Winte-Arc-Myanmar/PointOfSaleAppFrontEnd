"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useLocations, useUpdateLocation } from "@/presentation/hooks/useLocations";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const PARENT_NONE = "__none__";

const LOCATION_TYPES = [
  { value: "warehouse", label: "Warehouse" },
  { value: "store", label: "Store" },
  { value: "zone", label: "Zone" },
  { value: "bin", label: "Bin" },
  { value: "shelf", label: "Shelf" },
  { value: "other", label: "Other" },
] as const;

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  parentLocationId: z.string(),
  type: z.string().min(1, "Type is required"),
});

type LocationFormData = z.infer<typeof schema>;

const REDIRECT_DELAY_MS = 1200;

export function EditLocationForm({ locationId }: { locationId: string }) {
  const router = useRouter();
  const { tenantId: lockedTenantId } = usePermissions();
  const toast = useToast();
  const { data: location, isLoading, error } = useLocation(locationId);
  const { data: tenants = [] } = useTenants();
  const { data: allLocations = [], isLoading: isLocationsLoading } = useLocations({
    page: 1,
    limit: 200,
  });
  const updateLocation = useUpdateLocation();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<LocationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      tenantId: "",
      parentLocationId: PARENT_NONE,
      type: "warehouse",
    },
  });

  useEffect(() => {
    if (!location) return;
    form.reset({
      name: location.name,
      tenantId: location.tenantId,
      parentLocationId: location.parentLocationId ?? PARENT_NONE,
      type: location.type || "warehouse",
    });
  }, [location, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const selectedTenantId = useWatch({
    control: form.control,
    name: "tenantId",
  });

  const parentOptions = useMemo(
    () =>
      allLocations.filter(
        (l) =>
          (selectedTenantId ? l.tenantId === selectedTenantId : false) &&
          l.id !== locationId
      ),
    [allLocations, selectedTenantId, locationId]
  );

  useEffect(() => {
    if (isLocationsLoading) return;
    const pid = form.getValues("parentLocationId");
    if (
      pid &&
      pid !== PARENT_NONE &&
      !parentOptions.some((l) => l.id === pid)
    ) {
      form.setValue("parentLocationId", PARENT_NONE);
    }
  }, [parentOptions, form, isLocationsLoading]);

  const onSubmit = (data: LocationFormData) => {
    setShowSuccess(false);
    updateLocation.mutate(
      {
        id: locationId,
        data: {
          name: data.name,
          tenantId: data.tenantId,
          type: data.type,
          parentLocationId:
            data.parentLocationId && data.parentLocationId !== PARENT_NONE
              ? data.parentLocationId
              : null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Location updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/locations/${locationId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update location."),
      }
    );
  };

  if (isLoading) {
    return <AppLoader fullScreen={false} size="sm" message="Loading location..." />;
  }
  if (error || !location) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Location not found.</p>
        <Link href="/locations">
          <Button variant="outline">Back to locations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/locations/${locationId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit location</h1>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid gap-2">
          <Label htmlFor="edit-loc-name">Name</Label>
          <Input id="edit-loc-name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-loc-tenant">Tenant</Label>
          <Controller
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!!lockedTenantId}
              >
                <SelectTrigger id="edit-loc-tenant">
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
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-loc-parent">Parent location (optional)</Label>
          <Controller
            control={form.control}
            name="parentLocationId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedTenantId || isLocationsLoading}
              >
                <SelectTrigger id="edit-loc-parent">
                  <SelectValue placeholder="None — top level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PARENT_NONE}>None (top level)</SelectItem>
                  {parentOptions.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="edit-loc-type">Type</Label>
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="edit-loc-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {showSuccess && (
          <p className="text-sm font-medium text-green-600">Saved. Redirecting…</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={updateLocation.isPending}>
            {updateLocation.isPending ? "Saving…" : "Save changes"}
          </Button>
          <Link href={`/locations/${locationId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
