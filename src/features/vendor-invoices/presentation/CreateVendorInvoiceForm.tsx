"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateVendorInvoice } from "@/presentation/hooks/useVendorInvoices";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useVendors } from "@/presentation/hooks/useVendors";
import { usePurchaseOrders } from "@/presentation/hooks/usePurchaseOrders";
import { useGoodsReceivedNotes } from "@/presentation/hooks/useGoodsReceivedNotes";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

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

const defaultValues: FormData = {
  tenantId: "",
  vendorId: "",
  invoiceNumber: "",
  invoiceType: "STANDARD",
  totalAmount: "",
  matchedPoId: "",
  matchedGrnId: "",
};

export interface CreateVendorInvoiceFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
  defaultGrnId?: string;
  defaultPurchaseOrderId?: string;
}

export function CreateVendorInvoiceForm({
  onSuccess,
  formId,
  onLoadingChange,
  defaultGrnId,
  defaultPurchaseOrderId,
}: CreateVendorInvoiceFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateVendorInvoice();
  const toast = useToast();
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: vendorsData } = useVendors({ page: 1, limit: LIST_LIMIT });
  const vendors = getPaginatedItems(vendorsData);
  const { data: purchaseOrdersData } = usePurchaseOrders({ page: 1, limit: LIST_LIMIT });
  const purchaseOrders = getPaginatedItems(purchaseOrdersData);
  const { data: grnsData } = useGoodsReceivedNotes({ page: 1, limit: LIST_LIMIT });
  const grns = getPaginatedItems(grnsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
      matchedPoId: defaultPurchaseOrderId ?? "",
      matchedGrnId: defaultGrnId ?? "",
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
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    if (defaultPurchaseOrderId) {
      form.setValue("matchedPoId", defaultPurchaseOrderId);
      const match = purchaseOrders.find(
        (po) => String(po.id) === defaultPurchaseOrderId,
      );
      if (match && !lockedTenantId) {
        form.setValue("tenantId", match.tenantId);
      }
    }
  }, [defaultPurchaseOrderId, purchaseOrders, lockedTenantId, form]);

  useEffect(() => {
    if (defaultGrnId) {
      form.setValue("matchedGrnId", defaultGrnId);
      const match = grns.find((g) => String(g.id) === defaultGrnId);
      if (match && !lockedTenantId) {
        form.setValue("tenantId", match.tenantId);
      }
      if (match?.purchaseOrderId && !form.getValues("matchedPoId")) {
        form.setValue("matchedPoId", match.purchaseOrderId);
      }
    }
  }, [defaultGrnId, grns, lockedTenantId, form]);

  useEffect(() => {
    const currentVendor = form.getValues("vendorId");
    if (currentVendor && !filteredVendors.some((v) => String(v.id) === currentVendor)) {
      form.setValue("vendorId", "");
    }
    const currentPo = form.getValues("matchedPoId");
    if (
      currentPo &&
      currentPo !== defaultPurchaseOrderId &&
      !filteredPurchaseOrders.some((po) => String(po.id) === currentPo)
    ) {
      form.setValue("matchedPoId", "");
    }
    const currentGrn = form.getValues("matchedGrnId");
    if (
      currentGrn &&
      currentGrn !== defaultGrnId &&
      !filteredGrns.some((g) => String(g.id) === currentGrn)
    ) {
      form.setValue("matchedGrnId", "");
    }
  }, [
    filteredVendors,
    filteredPurchaseOrders,
    filteredGrns,
    form,
    defaultPurchaseOrderId,
    defaultGrnId,
  ]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        vendorId: data.vendorId,
        invoiceNumber: data.invoiceNumber.trim(),
        invoiceType: data.invoiceType,
        totalAmount: data.totalAmount.trim(),
        matchedPoId: data.matchedPoId,
        matchedGrnId: data.matchedGrnId,
      },
      {
        onSuccess: () => {
          toast.success("Vendor invoice created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
            matchedPoId: defaultPurchaseOrderId ?? "",
            matchedGrnId: defaultGrnId ?? "",
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create vendor invoice."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tenantId">Tenant</Label>
          <Controller
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  form.setValue("vendorId", "");
                  form.setValue("matchedPoId", defaultPurchaseOrderId ?? "");
                  form.setValue("matchedGrnId", defaultGrnId ?? "");
                }}
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
          {form.formState.errors.tenantId && (
            <p className="text-sm text-red-600">{form.formState.errors.tenantId.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="invoiceNumber">Invoice number</Label>
          <Input
            id="invoiceNumber"
            {...form.register("invoiceNumber")}
            placeholder="INV-001"
          />
          {form.formState.errors.invoiceNumber && (
            <p className="text-sm text-red-600">
              {form.formState.errors.invoiceNumber.message}
            </p>
          )}
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
                  <SelectValue
                    placeholder={!selectedTenantId ? "Select tenant first" : "Select vendor"}
                  />
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
          {form.formState.errors.vendorId && (
            <p className="text-sm text-red-600">{form.formState.errors.vendorId.message}</p>
          )}
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
          {form.formState.errors.invoiceType && (
            <p className="text-sm text-red-600">
              {form.formState.errors.invoiceType.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="totalAmount">Total amount</Label>
          <Input
            id="totalAmount"
            {...form.register("totalAmount")}
            placeholder="15000.00"
          />
          {form.formState.errors.totalAmount && (
            <p className="text-sm text-red-600">
              {form.formState.errors.totalAmount.message}
            </p>
          )}
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
                  <SelectValue
                    placeholder={
                      !selectedTenantId ? "Select tenant first" : "Select purchase order"
                    }
                  />
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
          {form.formState.errors.matchedPoId && (
            <p className="text-sm text-red-600">
              {form.formState.errors.matchedPoId.message}
            </p>
          )}
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
                <SelectValue
                  placeholder={!selectedTenantId ? "Select tenant first" : "Select GRN"}
                />
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
        {form.formState.errors.matchedGrnId && (
          <p className="text-sm text-red-600">
            {form.formState.errors.matchedGrnId.message}
          </p>
        )}
      </div>
    </form>
  );
}
