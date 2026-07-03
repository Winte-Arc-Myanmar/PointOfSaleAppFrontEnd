"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useCustomers } from "@/presentation/hooks/useCustomers";
import { useDiningZones } from "@/presentation/hooks/useDiningZones";
import { useWaitlistEntry, useUpdateWaitlistEntry } from "@/presentation/hooks/useWaitlist";
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
const NONE = "__none__";

const schema = z.object({
  locationId: z.string().min(1, "Location is required"),
  customerId: z.string().optional(),
  guestName: z.string().min(1, "Guest name is required"),
  guestPhone: z.string().optional(),
  partySize: z.number().int().min(1),
  estimatedWaitMins: z.number().int().min(1).optional(),
  preferredZoneId: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function EditWaitlistForm({ waitlistId }: { waitlistId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data: waitlistEntry, isLoading, error } = useWaitlistEntry(waitlistId);
  const update = useUpdateWaitlistEntry();
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const { data: customersData } = useCustomers({ page: 1, limit: LIST_LIMIT });
  const { data: zonesData } = useDiningZones({ page: 1, limit: LIST_LIMIT });

  const locations = getPaginatedItems(locationsData);
  const customers = getPaginatedItems(customersData);
  const zones = getPaginatedItems(zonesData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      locationId: "",
      customerId: "",
      guestName: "",
      guestPhone: "",
      partySize: 2,
      estimatedWaitMins: 20,
      preferredZoneId: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!waitlistEntry) return;
    form.reset({
      locationId: waitlistEntry.locationId,
      customerId: waitlistEntry.customerId ?? "",
      guestName: waitlistEntry.guestName,
      guestPhone: waitlistEntry.guestPhone ?? "",
      partySize: waitlistEntry.partySize,
      estimatedWaitMins: waitlistEntry.estimatedWaitMins ?? 20,
      preferredZoneId: waitlistEntry.preferredZoneId ?? "",
      notes: waitlistEntry.notes ?? "",
    });
  }, [waitlistEntry, form]);

  const filteredZones = useMemo(
    () =>
      waitlistEntry
        ? zones.filter((zone) => zone.tenantId === waitlistEntry.tenantId)
        : zones,
    [waitlistEntry, zones],
  );

  const submit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: waitlistId,
        data: {
          locationId: data.locationId,
          customerId: data.customerId?.trim() || undefined,
          guestName: data.guestName.trim(),
          guestPhone: data.guestPhone?.trim() || undefined,
          partySize: data.partySize,
          estimatedWaitMins: data.estimatedWaitMins || undefined,
          preferredZoneId: data.preferredZoneId?.trim() || undefined,
          notes: data.notes?.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Waitlist entry updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/waitlist/${waitlistId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update waitlist entry."),
      },
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !waitlistEntry) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Waitlist entry not found.</p>
        <Link href="/waitlist">
          <Button variant="outline">Back to Waitlist</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/waitlist/${waitlistId}`}>
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Edit waitlist entry</h1>
          <p className="text-sm text-muted">{waitlistEntry.guestName}</p>
        </div>
      </div>

      {showSuccess && <p className="text-sm text-emerald-600">Saved. Redirecting...</p>}

      <form onSubmit={form.handleSubmit(submit)} className="space-y-4 max-w-3xl">
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
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={String(location.id)}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="guestName">Guest name</Label>
            <Input id="guestName" {...form.register("guestName")} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="partySize">Party size</Label>
            <Input id="partySize" type="number" {...form.register("partySize", { valueAsNumber: true })} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="estimatedWaitMins">Estimated wait (mins)</Label>
            <Input
              id="estimatedWaitMins"
              type="number"
              {...form.register("estimatedWaitMins", { valueAsNumber: true })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="guestPhone">Guest phone</Label>
            <Input id="guestPhone" {...form.register("guestPhone")} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="customerId">Customer</Label>
            <Controller
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <Select value={field.value || NONE} onValueChange={(value) => field.onChange(value === NONE ? "" : value)}>
                  <SelectTrigger id="customerId">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>No linked customer</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={String(customer.id)}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="preferredZoneId">Preferred zone</Label>
            <Controller
              control={form.control}
              name="preferredZoneId"
              render={({ field }) => (
                <Select value={field.value || NONE} onValueChange={(value) => field.onChange(value === NONE ? "" : value)}>
                  <SelectTrigger id="preferredZoneId">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>No preference</SelectItem>
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
          <Link href={`/waitlist/${waitlistId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
