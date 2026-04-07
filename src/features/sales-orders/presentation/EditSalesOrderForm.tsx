"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { useSalesOrder, useUpdateSalesOrder } from "@/presentation/hooks/useSalesOrders";
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
import { AppLoader } from "@/presentation/components/loader";

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

const REDIRECT_DELAY_MS = 1500;

export function EditSalesOrderForm({ salesOrderId }: { salesOrderId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateSalesOrder();
  const { data: order, isLoading, error } = useSalesOrder(salesOrderId);
  const { data: tenants = [] } = useTenants();
  const { data: customers = [] } = useCustomers();
  const { data: locations = [] } = useLocations({ page: 1, limit: 200 });
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
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
    },
  });

  useEffect(() => {
    if (order) {
      form.reset({
        tenantId: order.tenantId,
        customerId: order.customerId,
        locationId: order.locationId,
        orderNumber: order.orderNumber,
        salesChannel: order.salesChannel,
        idempotencyKey: order.idempotencyKey ?? "",
        subtotal: order.subtotal,
        totalDiscount: order.totalDiscount,
        totalTax: order.totalTax,
        grandTotal: order.grandTotal,
        status: order.status,
      });
    }
  }, [order, form]);

  const tenantId = form.watch("tenantId");

  const filteredCustomers = useMemo(
    () => customers.filter((c) => (tenantId ? c.tenantId === tenantId : true)),
    [customers, tenantId]
  );
  const filteredLocations = useMemo(
    () => locations.filter((l) => (tenantId ? l.tenantId === tenantId : true)),
    [locations, tenantId]
  );

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    const idem = data.idempotencyKey.trim();
    update.mutate(
      {
        id: salesOrderId,
        data: {
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
      },
      {
        onSuccess: () => {
          toast.success("Sales order updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/sales-orders/${salesOrderId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update sales order."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !order) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Sales order not found.</p>
        <Link href="/sales-orders">
          <Button variant="outline">Back to Sales Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/sales-orders/${salesOrderId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit sales order</h1>
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
            <Label>Status</Label>
            <Input {...form.register("status")} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Customer</Label>
            <Controller
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!tenantId}>
                  <SelectTrigger>
                    <SelectValue placeholder={!tenantId ? "Select tenant first" : "Select customer"} />
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
            <Label>Order number</Label>
            <Input {...form.register("orderNumber")} />
          </div>
          <div className="grid gap-2">
            <Label>Sales channel</Label>
            <Input {...form.register("salesChannel")} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Idempotency key</Label>
          <Input {...form.register("idempotencyKey")} />
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

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Sales order updated successfully. Redirecting...
          </p>
        )}
        {update.isError && <p className="text-sm text-red-600">Failed to update sales order.</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/sales-orders/${salesOrderId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

