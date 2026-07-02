"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocations } from "@/presentation/hooks/useLocations";
import {
  useKitchenPrinter,
  useUpdateKitchenPrinter,
} from "@/presentation/hooks/useKitchenPrinters";
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

const REDIRECT_DELAY_MS = 1500;
const LIST_LIMIT = 200;

const schema = z.object({
  locationId: z.string().min(1, "Location is required"),
  name: z.string().min(1, "Name is required"),
  ipAddress: z
    .string()
    .min(1, "IP address is required")
    .regex(
      /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
      "Enter a valid IPv4 address"
    ),
  port: z.number().int().min(1).max(65535),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function EditKitchenPrinterForm({ printerId }: { printerId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateKitchenPrinter();
  const { data: printer, isLoading, error } = useKitchenPrinter(printerId);
  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const locations = getPaginatedItems(locationsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      locationId: "",
      name: "",
      ipAddress: "",
      port: 9100,
      isActive: true,
    },
  });

  const filteredLocations = useMemo(
    () =>
      locations.filter((location) => (printer ? location.tenantId === printer.tenantId : true)),
    [locations, printer]
  );

  useEffect(() => {
    if (printer) {
      form.reset({
        locationId: printer.locationId,
        name: printer.name,
        ipAddress: printer.ipAddress,
        port: printer.port,
        isActive: printer.isActive,
      });
    }
  }, [printer, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: printerId,
        data: {
          locationId: data.locationId,
          name: data.name.trim(),
          ipAddress: data.ipAddress.trim(),
          port: data.port,
          isActive: data.isActive,
        },
      },
      {
        onSuccess: () => {
          toast.success("Kitchen printer updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/kitchen-printers/${printerId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update kitchen printer."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !printer) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Kitchen printer not found.</p>
        <Link href="/kitchen-printers">
          <Button variant="outline">Back to Kitchen Printers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/kitchen-printers/${printerId}`}>
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Edit kitchen printer</h1>
          <p className="text-sm text-muted">{printer.name}</p>
        </div>
      </div>

      {showSuccess && (
        <p className="text-sm text-emerald-600">Saved. Redirecting to printer details...</p>
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
            <Label htmlFor="name">Printer name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ipAddress">IP address</Label>
            <Input id="ipAddress" {...form.register("ipAddress")} className="font-mono" />
            {form.formState.errors.ipAddress && (
              <p className="text-sm text-red-600">{form.formState.errors.ipAddress.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="port">Port</Label>
            <Input id="port" type="number" {...form.register("port", { valueAsNumber: true })} />
            {form.formState.errors.port && (
              <p className="text-sm text-red-600">{form.formState.errors.port.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-2 max-w-xs">
          <Label htmlFor="isActive">Status</Label>
          <Controller
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <Select
                value={field.value ? "true" : "false"}
                onValueChange={(value) => field.onChange(value === "true")}
              >
                <SelectTrigger id="isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/kitchen-printers/${printerId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
