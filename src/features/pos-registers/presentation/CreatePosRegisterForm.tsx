"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePosRegister } from "@/presentation/hooks/usePosRegisters";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useLocations } from "@/presentation/hooks/useLocations";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { generateBrowserDeviceId } from "@/lib/device-fingerprint";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  locationId: z.string().min(1, "Location is required"),
  name: z.string().min(1, "Name is required"),
  macAddress: z.string().min(1, "MAC address is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  locationId: "",
  name: "",
  macAddress: "",
};

export interface CreatePosRegisterFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreatePosRegisterForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreatePosRegisterFormProps) {
  const create = useCreatePosRegister();
  const toast = useToast();
  const { data: tenants = [] } = useTenants();
  const { data: locations = [] } = useLocations({ page: 1, limit: 200 });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  const tenantId = useWatch({ control: form.control, name: "tenantId" });
  const filteredLocations = useMemo(
    () => locations.filter((l) => (tenantId ? l.tenantId === tenantId : true)),
    [locations, tenantId]
  );

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        locationId: data.locationId,
        name: data.name,
        macAddress: data.macAddress,
      },
      {
        onSuccess: () => {
          toast.success("POS register created.");
          form.reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create POS register."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Tenant</Label>
          <Controller
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
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
          <Label>Location</Label>
          <Controller
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!tenantId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={!tenantId ? "Select tenant first" : "Select location"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredLocations.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.name}
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input {...form.register("name")} placeholder="Register 1" />
        </div>
        <div className="grid gap-2">
          <Label>MAC address</Label>
          <div className="flex gap-2">
            <Input
              {...form.register("macAddress")}
              placeholder="AA:BB:CC:DD:EE:FF"
              className="font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => form.setValue("macAddress", generateBrowserDeviceId())}
            >
              Generate device ID
            </Button>
          </div>
          <p className="text-xs text-muted">
            Browsers can’t read the real MAC address. Use “Generate device ID” to register this PC.
          </p>
        </div>
      </div>

      {!formId && (
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Create Register"}
        </Button>
      )}
    </form>
  );
}

