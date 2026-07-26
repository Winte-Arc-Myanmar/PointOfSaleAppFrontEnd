"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  usePurchaseOrder,
  useUpdatePurchaseOrder,
} from "@/presentation/hooks/usePurchaseOrders";
import { usePurchaseRequisitions } from "@/presentation/hooks/usePurchaseRequisitions";
import { useVendors } from "@/presentation/hooks/useVendors";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePermissions } from "@/presentation/hooks/usePermissions";
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

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  vendorId: z.string().min(1, "Vendor is required"),
  requisitionId: z.string().min(1, "Requisition is required"),
  poNumber: z.string().min(1, "PO number is required"),
  currency: z.string().min(1, "Currency is required"),
  totalAmount: z.string().min(1, "Total amount is required"),
  expectedDeliveryDate: z.string().min(1, "Expected delivery date is required"),
});

type FormData = z.infer<typeof schema>;

export function EditPurchaseOrderForm({ purchaseOrderId }: { purchaseOrderId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { tenantId: lockedTenantId } = usePermissions();
  const update = useUpdatePurchaseOrder();
  const { data: order, isLoading, error } = usePurchaseOrder(purchaseOrderId);
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: vendorsData } = useVendors({ page: 1, limit: LIST_LIMIT });
  const vendors = getPaginatedItems(vendorsData);
  const { data: requisitionsData } = usePurchaseRequisitions({
    page: 1,
    limit: LIST_LIMIT,
  });
  const requisitions = getPaginatedItems(requisitionsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      vendorId: "",
      requisitionId: "",
      poNumber: "",
      currency: "USD",
      totalAmount: "",
      expectedDeliveryDate: "",
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });

  const filteredVendors = useMemo(
    () =>
      vendors.filter((v) => (selectedTenantId ? v.tenantId === selectedTenantId : false)),
    [vendors, selectedTenantId]
  );

  const filteredRequisitions = useMemo(
    () =>
      requisitions.filter((r) =>
        selectedTenantId ? r.tenantId === selectedTenantId : false
      ),
    [requisitions, selectedTenantId]
  );

  useEffect(() => {
    if (order) {
      form.reset({
        tenantId: order.tenantId,
        vendorId: order.vendorId,
        requisitionId: order.requisitionId,
        poNumber: order.poNumber,
        currency: order.currency,
        totalAmount: order.totalAmount,
        expectedDeliveryDate: toDateInputValue(order.expectedDeliveryDate),
      });
    }
  }, [order, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: purchaseOrderId,
        data: {
          tenantId: data.tenantId,
          vendorId: data.vendorId,
          requisitionId: data.requisitionId,
          poNumber: data.poNumber.trim(),
          currency: data.currency.trim(),
          totalAmount: data.totalAmount.trim(),
          expectedDeliveryDate: data.expectedDeliveryDate,
        },
      },
      {
        onSuccess: () => {
          toast.success("Purchase order updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/purchase-orders/${purchaseOrderId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update purchase order."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !order) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Purchase order not found.</p>
        <Link href="/purchase-orders">
          <Button variant="outline">Back to Purchase Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/purchase-orders/${purchaseOrderId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit purchase order</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tenantId">Tenant</Label>
            <Controller
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={Boolean(lockedTenantId)}
                >
                  <SelectTrigger id="tenantId">
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
            <Label htmlFor="poNumber">PO number</Label>
            <Input id="poNumber" {...form.register("poNumber")} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="vendorId">Vendor</Label>
            <Controller
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedTenantId}
                >
                  <SelectTrigger id="vendorId">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredVendors.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="requisitionId">Requisition</Label>
            <Controller
              control={form.control}
              name="requisitionId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedTenantId}
                >
                  <SelectTrigger id="requisitionId">
                    <SelectValue placeholder="Select requisition" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRequisitions.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.department} ({String(r.id).slice(0, 8)}…)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" {...form.register("currency")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="totalAmount">Total amount</Label>
            <Input id="totalAmount" {...form.register("totalAmount")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expectedDeliveryDate">Expected delivery</Label>
            <Input
              id="expectedDeliveryDate"
              type="date"
              {...form.register("expectedDeliveryDate")}
            />
          </div>
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Purchase order updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/purchase-orders/${purchaseOrderId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
