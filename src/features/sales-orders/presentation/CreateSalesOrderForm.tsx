"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateSalesOrder } from "@/presentation/hooks/useSalesOrders";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useCustomers } from "@/presentation/hooks/useCustomers";
import { useLocations } from "@/presentation/hooks/useLocations";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  customerId: z.string().min(1, "Customer is required"),
  locationId: z.string().min(1, "Location is required"),
  orderNumber: z.string().min(1, "Order number is required"),
  salesChannel: z.string().min(1, "Sales channel is required"),
  idempotencyKey: z.string(),
  subtotal: z.number(),
  totalDiscount: z.number(),
  totalTax: z.number(),
  grandTotal: z.number(),
  status: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  customerId: "",
  locationId: "",
  orderNumber: "",
  salesChannel: "POS",
  idempotencyKey: "",
  subtotal: 0,
  totalDiscount: 0,
  totalTax: 0,
  grandTotal: 0,
  status: "DRAFT",
};

export interface CreateSalesOrderFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateSalesOrderForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateSalesOrderFormProps) {
  const create = useCreateSalesOrder();
  const toast = useToast();
  const { data: tenants = [] } = useTenants();
  const { data: customers = [] } = useCustomers();
  const { data: locations = [] } = useLocations({ page: 1, limit: 200 });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  const filteredCustomers = useMemo(
    () =>
      customers.filter((c) =>
        form.watch("tenantId") ? c.tenantId === form.watch("tenantId") : true
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customers, form.watch("tenantId")]
  );

  const filteredLocations = useMemo(
    () =>
      locations.filter((l) =>
        form.watch("tenantId") ? l.tenantId === form.watch("tenantId") : true
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locations, form.watch("tenantId")]
  );

  const onSubmit = (data: FormData) => {
    const idem = data.idempotencyKey.trim();
    create.mutate(
      {
        tenantId: data.tenantId,
        customerId: data.customerId,
        locationId: data.locationId,
        orderNumber: data.orderNumber,
        salesChannel: data.salesChannel,
        idempotencyKey: idem ? idem : null,
        subtotal: data.subtotal,
        totalDiscount: data.totalDiscount,
        totalTax: data.totalTax,
        grandTotal: data.grandTotal,
        status: data.status,
      },
      {
        onSuccess: () => {
          toast.success("Sales order created.");
          form.reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create sales order."),
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
          <Label>Status</Label>
          <Input {...form.register("status")} placeholder="DRAFT" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Customer</Label>
          <Controller
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={!form.watch("tenantId")}>
                <SelectTrigger>
                  <SelectValue placeholder={!form.watch("tenantId") ? "Select tenant first" : "Select customer"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredCustomers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
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
              <Select value={field.value} onValueChange={field.onChange} disabled={!form.watch("tenantId")}>
                <SelectTrigger>
                  <SelectValue placeholder={!form.watch("tenantId") ? "Select tenant first" : "Select location"} />
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
          <Label>Order number</Label>
          <Input {...form.register("orderNumber")} placeholder="SO-2026-0001" />
        </div>
        <div className="grid gap-2">
          <Label>Sales channel</Label>
          <Input {...form.register("salesChannel")} placeholder="POS" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Idempotency key</Label>
          <Input {...form.register("idempotencyKey")} placeholder="idem-key-001" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Subtotal</Label>
          <Input type="number" step="0.01" {...form.register("subtotal", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <Label>Total discount</Label>
          <Input type="number" step="0.01" {...form.register("totalDiscount", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <Label>Total tax</Label>
          <Input type="number" step="0.01" {...form.register("totalTax", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <Label>Grand total</Label>
          <Input type="number" step="0.01" {...form.register("grandTotal", { valueAsNumber: true })} />
        </div>
      </div>

      {!formId && (
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Create Sales Order"}
        </Button>
      )}
    </form>
  );
}

