"use client";

import { InfoTip } from "@/presentation/components/ui/info-tip";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePosRegister, useUpdatePosRegister } from "@/presentation/hooks/usePosRegisters";
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
import { AppLoader } from "@/presentation/components/loader";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useKitchenPrinters } from "@/presentation/hooks/useKitchenPrinters";
import { PrinterChecklist } from "@/features/kitchen-printers/presentation/PrinterChecklist";
import { printersFor } from "@/features/kitchen-printers/presentation/printers-for";
import { PosDeviceSetupFields } from "./PosDeviceSetupFields";

const NO_PRINTERS: string[] = [];

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  locationId: z.string().min(1, "Location is required"),
  name: z.string().min(1, "Name is required"),
  macAddress: z.string().min(1, "Device ID is required"),
  sellsAt: z.array(z.enum(["BAR", "KTV", "SPA"])).min(1, "Pick at least one"),
  shiftRule: z.enum(["PER_LOGIN", "DAILY"]),
  checkoutPrinterIds: z.array(z.string()),
  financePrinterIds: z.array(z.string()),
});

type FormData = z.infer<typeof schema>;

const REDIRECT_DELAY_MS = 1500;

export function EditPosRegisterForm({ registerId }: { registerId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdatePosRegister();
  const { data: reg, isLoading, error } = usePosRegister(registerId);
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsData);
  const { data: printersData } = useKitchenPrinters({ page: 1, limit: 200 });
  const printers = getPaginatedItems(printersData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      locationId: "",
      name: "",
      macAddress: "",
      sellsAt: ["BAR", "KTV", "SPA"],
      shiftRule: "PER_LOGIN",
      checkoutPrinterIds: [],
      financePrinterIds: [],
    },
  });

  useEffect(() => {
    if (reg) {
      form.reset({
        tenantId: reg.tenantId,
        locationId: reg.locationId,
        name: reg.name,
        macAddress: reg.macAddress,
        sellsAt: reg.sellsAt,
        shiftRule: reg.shiftRule,
        checkoutPrinterIds: reg.checkoutPrinterIds,
        financePrinterIds: reg.financePrinterIds,
      });
    }
  }, [reg, form]);

  const tenantId = useWatch({ control: form.control, name: "tenantId" });
  const filteredLocations = useMemo(
    () => locations.filter((l) => (tenantId ? l.tenantId === tenantId : true)),
    [locations, tenantId]
  );

  const selectedLocationId = useWatch({ control: form.control, name: "locationId" });
  const sellsAt = useWatch({ control: form.control, name: "sellsAt" });
  const shiftRule = useWatch({ control: form.control, name: "shiftRule" });
  const checkoutPrinterIds = useWatch({ control: form.control, name: "checkoutPrinterIds" }) ?? NO_PRINTERS;
  const financePrinterIds = useWatch({ control: form.control, name: "financePrinterIds" }) ?? NO_PRINTERS;
  const printerOptions = useMemo(
    () => ({
      CHECKOUT: printersFor(printers, "CHECKOUT", selectedLocationId, checkoutPrinterIds),
      FINANCE: printersFor(printers, "FINANCE", selectedLocationId, financePrinterIds),
    }),
    [printers, selectedLocationId, checkoutPrinterIds, financePrinterIds]
  );

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: registerId,
        data: {
          tenantId: data.tenantId,
          locationId: data.locationId,
          name: data.name,
          macAddress: data.macAddress,
          sellsAt: data.sellsAt,
          shiftRule: data.shiftRule,
          checkoutPrinterIds: data.checkoutPrinterIds,
          financePrinterIds: data.financePrinterIds,
        },
      },
      {
        onSuccess: () => {
          toast.success("POS register updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/pos-registers/${registerId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update POS register."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !reg) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">POS register not found.</p>
        <Link href="/pos-registers">
          <Button variant="outline">Back to POS registers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/pos-registers/${registerId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit POS register</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
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
          </div>

          <div className="grid gap-2">
            <Label>Location</Label>
            <Controller
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!tenantId}>
                  <SelectTrigger>
                    <SelectValue placeholder={!tenantId ? "Select tenant first" : "Select location"} />
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
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input {...form.register("name")} />
          </div>
          <div className="grid gap-2">
            <Label>
            Device ID
            <InfoTip text="Click Generate to register this PC." />
          </Label>
            <div className="flex gap-2">
              <Input className="font-mono text-sm" {...form.register("macAddress")} />
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue("macAddress", generateBrowserDeviceId())}
              >
                Generate device ID
              </Button>
            </div>
          </div>
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            POS register updated successfully. Redirecting...
          </p>
        )}
        {update.isError && <p className="text-sm text-red-600">Failed to update POS register.</p>}

      <PosDeviceSetupFields
        sellsAt={sellsAt}
        onSellsAtChange={(kinds) => form.setValue("sellsAt", kinds, { shouldDirty: true, shouldValidate: true })}
        shiftRule={shiftRule}
        onShiftRuleChange={(rule) => form.setValue("shiftRule", rule, { shouldDirty: true })}
        error={form.formState.errors.sellsAt?.message}
      />

      <PrinterChecklist
          label="Bill printer"
          hint="Empty = use the outlet\'s printer."
          emptyText="No checkout printers at this location."
          printers={printerOptions.CHECKOUT}
          value={checkoutPrinterIds}
          onChange={(ids) => form.setValue("checkoutPrinterIds", ids, { shouldDirty: true })}
          locationSelected={Boolean(selectedLocationId)}
        />

        <PrinterChecklist
          label="Finance printer"
          hint="Empty = use the outlet\'s printer."
          emptyText="No finance printers at this location."
          printers={printerOptions.FINANCE}
          value={financePrinterIds}
          onChange={(ids) => form.setValue("financePrinterIds", ids, { shouldDirty: true })}
          locationSelected={Boolean(selectedLocationId)}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/pos-registers/${registerId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

