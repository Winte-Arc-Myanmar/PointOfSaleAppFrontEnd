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
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
import { useReservation, useUpdateReservation } from "@/presentation/hooks/useReservations";
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
  guestEmail: z.string().email("Invalid email").or(z.literal("")).optional(),
  partySize: z.number().int().min(1),
  reservedAt: z.string().min(1),
  estimatedDurationMins: z.number().int().min(1).optional(),
  preferredZoneId: z.string().optional(),
  assignedTableId: z.string().optional(),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function EditReservationForm({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data: reservation, isLoading, error } = useReservation(reservationId);
  const update = useUpdateReservation();
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const { data: customersData } = useCustomers({ page: 1, limit: LIST_LIMIT });
  const { data: zonesData } = useDiningZones({ page: 1, limit: LIST_LIMIT });
  const { data: tablesData } = useDiningTables({ page: 1, limit: LIST_LIMIT });

  const locations = getPaginatedItems(locationsData);
  const customers = getPaginatedItems(customersData);
  const zones = getPaginatedItems(zonesData);
  const tables = getPaginatedItems(tablesData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      locationId: "",
      customerId: "",
      guestName: "",
      guestPhone: "",
      guestEmail: "",
      partySize: 2,
      reservedAt: "",
      estimatedDurationMins: 90,
      preferredZoneId: "",
      assignedTableId: "",
      specialRequests: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!reservation) return;
    form.reset({
      locationId: reservation.locationId,
      customerId: reservation.customerId ?? "",
      guestName: reservation.guestName,
      guestPhone: reservation.guestPhone ?? "",
      guestEmail: reservation.guestEmail ?? "",
      partySize: reservation.partySize,
      reservedAt: reservation.reservedAt
        ? new Date(reservation.reservedAt).toISOString().slice(0, 16)
        : "",
      estimatedDurationMins: reservation.estimatedDurationMins ?? 90,
      preferredZoneId: reservation.preferredZoneId ?? "",
      assignedTableId: reservation.assignedTableId ?? "",
      specialRequests: reservation.specialRequests ?? "",
      notes: reservation.notes ?? "",
    });
  }, [reservation, form]);

  const filteredZones = useMemo(
    () =>
      reservation
        ? zones.filter((zone) => zone.tenantId === reservation.tenantId)
        : zones,
    [reservation, zones],
  );

  const filteredTables = useMemo(
    () =>
      reservation
        ? tables.filter((table) => table.tenantId === reservation.tenantId)
        : tables,
    [reservation, tables],
  );

  const submit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: reservationId,
        data: {
          locationId: data.locationId,
          customerId: data.customerId?.trim() || undefined,
          guestName: data.guestName.trim(),
          guestPhone: data.guestPhone?.trim() || undefined,
          guestEmail: data.guestEmail?.trim() || undefined,
          partySize: data.partySize,
          reservedAt: new Date(data.reservedAt).toISOString(),
          estimatedDurationMins: data.estimatedDurationMins || undefined,
          preferredZoneId: data.preferredZoneId?.trim() || undefined,
          assignedTableId: data.assignedTableId?.trim() || undefined,
          specialRequests: data.specialRequests?.trim() || undefined,
          notes: data.notes?.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Reservation updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/reservations/${reservationId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update reservation."),
      },
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !reservation) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Reservation not found.</p>
        <Link href="/reservations">
          <Button variant="outline">Back to Reservations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/reservations/${reservationId}`}>
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Edit reservation</h1>
          <p className="text-sm text-muted">{reservation.guestName}</p>
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
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="reservedAt">Reserved at</Label>
            <Input id="reservedAt" type="datetime-local" {...form.register("reservedAt")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="partySize">Party size</Label>
            <Input id="partySize" type="number" {...form.register("partySize", { valueAsNumber: true })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="estimatedDurationMins">Duration (mins)</Label>
            <Input
              id="estimatedDurationMins"
              type="number"
              {...form.register("estimatedDurationMins", { valueAsNumber: true })}
            />
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
          <Label htmlFor="assignedTableId">Assigned table</Label>
          <Controller
            control={form.control}
            name="assignedTableId"
            render={({ field }) => (
              <Select value={field.value || NONE} onValueChange={(value) => field.onChange(value === NONE ? "" : value)}>
                <SelectTrigger id="assignedTableId">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Not assigned</SelectItem>
                  {filteredTables.map((table) => (
                    <SelectItem key={table.id} value={String(table.id)}>
                      {table.tableNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="guestPhone">Guest phone</Label>
            <Input id="guestPhone" {...form.register("guestPhone")} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="guestEmail">Guest email</Label>
            <Input id="guestEmail" type="email" {...form.register("guestEmail")} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="specialRequests">Special requests</Label>
          <textarea
            id="specialRequests"
            {...form.register("specialRequests")}
            className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
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
          <Link href={`/reservations/${reservationId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
