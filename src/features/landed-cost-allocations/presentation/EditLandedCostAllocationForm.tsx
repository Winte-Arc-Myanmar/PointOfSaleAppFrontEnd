"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useLandedCostAllocation,
  useUpdateLandedCostAllocation,
} from "@/presentation/hooks/useLandedCostAllocations";
import { useVendorInvoices } from "@/presentation/hooks/useVendorInvoices";
import { useGoodsReceivedNotes } from "@/presentation/hooks/useGoodsReceivedNotes";
import { useGrnLines } from "@/presentation/hooks/useGrnLines";
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

const ALLOCATION_METHODS = ["BY_VALUE", "BY_QUANTITY", "BY_WEIGHT"] as const;

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  sourceInvoiceId: z.string().min(1, "Source invoice is required"),
  targetGrnId: z.string().min(1, "Target GRN is required"),
  targetGrnLineId: z.string().min(1, "Target GRN line is required"),
  allocationMethod: z.enum(ALLOCATION_METHODS),
  allocatedAmount: z.string().min(1, "Allocated amount is required"),
  glJournalPosted: z.boolean(),
});

type FormData = z.infer<typeof schema>;

function asAllocationMethod(value: string): FormData["allocationMethod"] {
  return (ALLOCATION_METHODS as readonly string[]).includes(value)
    ? (value as FormData["allocationMethod"])
    : "BY_VALUE";
}

export function EditLandedCostAllocationForm({
  allocationId,
}: {
  allocationId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const { tenantId: lockedTenantId } = usePermissions();
  const update = useUpdateLandedCostAllocation();
  const { data: allocation, isLoading, error } = useLandedCostAllocation(allocationId);
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: invoicesData } = useVendorInvoices({ page: 1, limit: LIST_LIMIT });
  const invoices = getPaginatedItems(invoicesData);
  const { data: grnsData } = useGoodsReceivedNotes({ page: 1, limit: LIST_LIMIT });
  const grns = getPaginatedItems(grnsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      sourceInvoiceId: "",
      targetGrnId: "",
      targetGrnLineId: "",
      allocationMethod: "BY_VALUE",
      allocatedAmount: "0.00",
      glJournalPosted: false,
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });
  const selectedGrnId = useWatch({ control: form.control, name: "targetGrnId" });

  const { data: grnLinesData } = useGrnLines(selectedGrnId || null, {
    page: 1,
    limit: LIST_LIMIT,
  });
  const grnLines = getPaginatedItems(grnLinesData);

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((inv) =>
        selectedTenantId ? inv.tenantId === selectedTenantId : false
      ),
    [invoices, selectedTenantId]
  );

  const filteredGrns = useMemo(
    () =>
      grns.filter((g) => (selectedTenantId ? g.tenantId === selectedTenantId : false)),
    [grns, selectedTenantId]
  );

  useEffect(() => {
    if (allocation) {
      form.reset({
        tenantId: allocation.tenantId,
        sourceInvoiceId: allocation.sourceInvoiceId,
        targetGrnId: allocation.targetGrnId,
        targetGrnLineId: allocation.targetGrnLineId,
        allocationMethod: asAllocationMethod(allocation.allocationMethod),
        allocatedAmount: allocation.allocatedAmount,
        glJournalPosted: allocation.glJournalPosted,
      });
    }
  }, [allocation, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: allocationId,
        data: {
          tenantId: data.tenantId,
          sourceInvoiceId: data.sourceInvoiceId,
          targetGrnId: data.targetGrnId,
          targetGrnLineId: data.targetGrnLineId.trim(),
          allocationMethod: data.allocationMethod,
          allocatedAmount: data.allocatedAmount.trim(),
          glJournalPosted: data.glJournalPosted,
        },
      },
      {
        onSuccess: () => {
          toast.success("Landed cost allocation updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/landed-cost-allocations/${allocationId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update landed cost allocation."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !allocation) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Landed cost allocation not found.</p>
        <Link href="/landed-cost-allocations">
          <Button variant="outline">Back to Landed Cost Allocations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/landed-cost-allocations/${allocationId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit landed cost allocation</h1>
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
            <Label htmlFor="sourceInvoiceId">Source invoice</Label>
            <Controller
              control={form.control}
              name="sourceInvoiceId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedTenantId}
                >
                  <SelectTrigger id="sourceInvoiceId">
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredInvoices.map((inv) => (
                      <SelectItem key={inv.id} value={String(inv.id)}>
                        {inv.invoiceNumber}
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
            <Label htmlFor="targetGrnId">Target GRN</Label>
            <Controller
              control={form.control}
              name="targetGrnId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    form.setValue("targetGrnLineId", "");
                  }}
                  disabled={!selectedTenantId}
                >
                  <SelectTrigger id="targetGrnId">
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
          <div className="grid gap-2">
            <Label htmlFor="targetGrnLineId">Target GRN line</Label>
            {selectedGrnId && grnLines.length > 0 ? (
              <Controller
                control={form.control}
                name="targetGrnLineId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="targetGrnLineId">
                      <SelectValue placeholder="Select GRN line" />
                    </SelectTrigger>
                    <SelectContent>
                      {grnLines.map((line) => (
                        <SelectItem key={line.id} value={String(line.id)}>
                          {line.productId || String(line.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <Input
                id="targetGrnLineId"
                {...form.register("targetGrnLineId")}
                placeholder="Enter GRN line UUID"
                disabled={!selectedGrnId}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="allocationMethod">Allocation method</Label>
            <Controller
              control={form.control}
              name="allocationMethod"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="allocationMethod">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOCATION_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="allocatedAmount">Allocated amount</Label>
            <Input id="allocatedAmount" {...form.register("allocatedAmount")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="glJournalPosted">GL journal posted</Label>
            <Controller
              control={form.control}
              name="glJournalPosted"
              render={({ field }) => (
                <Select
                  value={field.value ? "true" : "false"}
                  onValueChange={(value) => field.onChange(value === "true")}
                >
                  <SelectTrigger id="glJournalPosted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Landed cost allocation updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/landed-cost-allocations/${allocationId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
