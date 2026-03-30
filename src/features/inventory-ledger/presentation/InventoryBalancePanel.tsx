"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useInventoryBalanceLookup } from "@/presentation/hooks/useInventoryLedger";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useProductVariants } from "@/presentation/hooks/useProductVariants";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const schema = z.object({
  productId: z.string().min(1, "Product is required"),
  variantId: z.string().min(1, "Variant is required"),
  locationId: z.string().min(1, "Location is required"),
});

type FormValues = z.infer<typeof schema>;

function formatBalancePayload(data: unknown): string {
  if (data == null) return "—";
  if (typeof data === "string") return data;
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

function pickBalanceSummary(
  payload: unknown
): { variantId?: string; locationId?: string; balance?: number } | null {
  if (payload == null || typeof payload !== "object") return null;
  const rec = payload as Record<string, unknown>;
  const variantId = typeof rec.variantId === "string" ? rec.variantId : undefined;
  const locationId =
    typeof rec.locationId === "string" ? rec.locationId : undefined;
  const balance =
    typeof rec.balance === "number"
      ? rec.balance
      : typeof rec.balance === "string"
        ? Number(rec.balance)
        : undefined;
  const balanceSafe =
    balance != null && Number.isFinite(balance) ? balance : undefined;
  if (!variantId && !locationId && balanceSafe == null) return null;
  return { variantId, locationId, balance: balanceSafe };
}

export function InventoryBalancePanel() {
  const { tenantId: lockedTenantId } = usePermissions();
  const toast = useToast();
  const balanceLookup = useInventoryBalanceLookup();
  const [result, setResult] = useState<unknown>(null);
  const { data: products = [] } = useProducts({ page: 1, limit: 200 });
  const { data: locations = [] } = useLocations({ page: 1, limit: 200 });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { productId: "", variantId: "", locationId: "" },
  });

  const productWatch = useWatch({ control: form.control, name: "productId" });
  const { data: variants = [], isLoading: variantsLoading } = useProductVariants(
    productWatch || null,
    { page: 1, limit: 100 }
  );

  const filteredLocations = locations.filter((l) =>
    lockedTenantId ? l.tenantId === lockedTenantId : true
  );

  const onSubmit = (data: FormValues) => {
    setResult(null);
    balanceLookup.mutate(
      { variantId: data.variantId, locationId: data.locationId },
      {
        onSuccess: (payload) => {
          setResult(payload);
          toast.success("Balance loaded.");
        },
        onError: () => {
          toast.error("Could not load balance.");
          setResult(null);
        },
      }
    );
  };

  return (
    <div className="rounded-xl border border-border bg-background/60 p-5 space-y-4">
      <p className="text-sm text-muted">
        Select a variant and location to view the current balance.
      </p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2 sm:col-span-2">
            <Label>Product</Label>
            <Controller
              control={form.control}
              name="productId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    form.setValue("variantId", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label>Variant</Label>
            <Controller
              control={form.control}
              name="variantId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!productWatch || variantsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={variantsLoading ? "…" : "Variant"} />
                  </SelectTrigger>
                  <SelectContent>
                    {variants.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.variantSku}
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLocations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <Button type="submit" disabled={balanceLookup.isPending}>
          {balanceLookup.isPending ? "Loading…" : "Get balance"}
        </Button>
      </form>
      {result != null && (
        <div className="rounded-xl border border-border bg-muted/15 p-4 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider">
                Balance summary
              </p>
              <p className="text-sm text-muted">
                Current on-hand balance for the selected variant at this location.
              </p>
            </div>
            {(() => {
              const summary = pickBalanceSummary(result);
              const balanceText =
                summary?.balance != null ? String(summary.balance) : "—";
              return (
                <div className="rounded-lg border border-border bg-background/70 px-4 py-3">
                  <p className="text-xs text-muted">Balance</p>
                  <p className="text-2xl font-semibold tabular-nums text-foreground">
                    {balanceText}
                  </p>
                </div>
              );
            })()}
          </div>

          {(() => {
            const summary = pickBalanceSummary(result);
            if (!summary?.variantId && !summary?.locationId) return null;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {summary.variantId ? (
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">
                      Variant ID
                    </p>
                    <p
                      className="mt-1 font-mono text-xs text-foreground break-all"
                      title={summary.variantId}
                    >
                      {summary.variantId}
                    </p>
                  </div>
                ) : null}
                {summary.locationId ? (
                  <div className="rounded-lg border border-border bg-background/70 p-3">
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">
                      Location ID
                    </p>
                    <p
                      className="mt-1 font-mono text-xs text-foreground break-all"
                      title={summary.locationId}
                    >
                      {summary.locationId}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
