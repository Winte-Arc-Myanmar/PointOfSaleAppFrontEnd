"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useVendorInvoice,
  useUpdateVendorInvoice,
} from "@/presentation/hooks/useVendorInvoices";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useVendors } from "@/presentation/hooks/useVendors";
import { usePurchaseOrders } from "@/presentation/hooks/usePurchaseOrders";
import { useGoodsReceivedNotes } from "@/presentation/hooks/useGoodsReceivedNotes";
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

const INVOICE_TYPES = ["STANDARD", "LANDED_COST", "CREDIT"] as const;

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  vendorId: z.string().min(1, "Vendor is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceType: z.enum(INVOICE_TYPES),
  totalAmount: z.string().min(1, "Total amount is required"),
  matchedPoId: z.string().min(1, "Matched purchase order is required"),
  matchedGrnId: z.string().min(1, "Matched GRN is required"),
});

type FormData = z.infer<typeof schema>;

function asInvoiceType(value: string): FormData["invoiceType"] {
  return (INVOICE_TYPES as readonly string[]).includes(value)
    ? (value as FormData["invoiceType"])
    : "STANDARD";
}

export function EditVendorInvoiceForm({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { tenantId: lockedTenantId } = usePermissions();
  const update = useUpdateVendorInvoice();
  const { data: invoice, isLoading, error } = useVendorInvoice(invoiceId);
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: vendorsData } = useVendors({ page: 1, limit: LIST_LIMIT });
  const vendors = getPaginatedItems(vendorsData);
  const { data: purchaseOrdersData } = usePurchaseOrders({ page: 1, limit: LIST_LIMIT });
  const purchaseOrders = getPaginatedItems(purchaseOrdersData);
  const { data: grnsData } = useGoodsReceivedNotes({ page: 1, limit: LIST_LIMIT });
  const grns = getPaginatedItems(grnsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      vendorId: "",
      invoiceNumber: "",
      invoiceType: "STANDARD",
      totalAmount: "",
      matchedPoId: "",
      matchedGrnId: "",
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });

  const filteredVendors = useMemo(
    () =>
      vendors.filter((v) => (selectedTenantId ? v.tenantId === selectedTenantId : false)),
    [vendors, selectedTenantId]
  );

  const filteredPurchaseOrders = useMemo(
    () =>
      purchaseOrders.filter((po) =>
        selectedTenantId ? po.tenantId === selectedTenantId : false
      ),
    [purchaseOrders, selectedTenantId]
  );

  const filteredGrns = useMemo(
    () =>
      grns.filter((g) => (selectedTenantId ? g.tenantId === selectedTenantId : false)),
    [grns, selectedTenantId]
  );

  useEffect(() => {
    if (invoice) {
      form.reset({
        tenantId: invoice.tenantId,
        vendorId: invoice.vendorId,
        invoiceNumber: invoice.invoiceNumber,
        invoiceType: asInvoiceType(invoice.invoiceType),
        totalAmount: invoice.totalAmount,
        matchedPoId: invoice.matchedPoId,
        matchedGrnId: invoice.matchedGrnId,
      });
    }
  }, [invoice, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: invoiceId,
        data: {
          tenantId: data.tenantId,
          vendorId: data.vendorId,
          invoiceNumber: data.invoiceNumber.trim(),
          invoiceType: data.invoiceType,
          totalAmount: data.totalAmount.trim(),
          matchedPoId: data.matchedPoId,
          matchedGrnId: data.matchedGrnId,
        },
      },
      {
        onSuccess: () => {
          toast.success("Vendor invoice updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/vendor-invoices/${invoiceId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update vendor invoice."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Vendor invoice not found.</p>
        <Link href="/vendor-invoices">
          <Button variant="outline">Back to Vendor Invoices</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/vendor-invoices/${invoiceId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit vendor invoice</h1>
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
            <Label htmlFor="invoiceNumber">Invoice number</Label>
            <Input id="invoiceNumber" {...form.register("invoiceNumber")} />
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
            <Label htmlFor="invoiceType">Invoice type</Label>
            <Controller
              control={form.control}
              name="invoiceType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="invoiceType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVOICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
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
            <Label htmlFor="totalAmount">Total amount</Label>
            <Input id="totalAmount" {...form.register("totalAmount")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="matchedPoId">Matched purchase order</Label>
            <Controller
              control={form.control}
              name="matchedPoId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedTenantId}
                >
                  <SelectTrigger id="matchedPoId">
                    <SelectValue placeholder="Select purchase order" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPurchaseOrders.map((po) => (
                      <SelectItem key={po.id} value={String(po.id)}>
                        {po.poNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="matchedGrnId">Matched GRN</Label>
          <Controller
            control={form.control}
            name="matchedGrnId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedTenantId}
              >
                <SelectTrigger id="matchedGrnId">
                  <SelectValue placeholder="Select GRN" />
                </SelectTrigger>
                <SelectContent>
                  {filteredGrns.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.grnNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Vendor invoice updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/vendor-invoices/${invoiceId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
