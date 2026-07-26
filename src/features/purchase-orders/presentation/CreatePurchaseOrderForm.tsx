"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePurchaseOrder } from "@/presentation/hooks/usePurchaseOrders";
import { usePurchaseRequisitions } from "@/presentation/hooks/usePurchaseRequisitions";
import { useVendors } from "@/presentation/hooks/useVendors";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
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

const defaultValues: FormData = {
  tenantId: "",
  vendorId: "",
  requisitionId: "",
  poNumber: "",
  currency: "USD",
  totalAmount: "",
  expectedDeliveryDate: "",
};

export interface CreatePurchaseOrderFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
  defaultRequisitionId?: string;
}

export function CreatePurchaseOrderForm({
  onSuccess,
  formId,
  onLoadingChange,
  defaultRequisitionId,
}: CreatePurchaseOrderFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreatePurchaseOrder();
  const toast = useToast();
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: vendorsData } = useVendors({ page: 1, limit: LIST_LIMIT });
  const vendors = getPaginatedItems(vendorsData);
  const { data: requisitionsData } = usePurchaseRequisitions({
    page: 1,
    limit: LIST_LIMIT,
  });
  const requisitions = getPaginatedItems(requisitionsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
      requisitionId: defaultRequisitionId ?? "",
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
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    if (defaultRequisitionId) {
      form.setValue("requisitionId", defaultRequisitionId);
      const match = requisitions.find((r) => String(r.id) === defaultRequisitionId);
      if (match && !lockedTenantId) {
        form.setValue("tenantId", match.tenantId);
      }
    }
  }, [defaultRequisitionId, requisitions, lockedTenantId, form]);

  useEffect(() => {
    const currentVendor = form.getValues("vendorId");
    if (currentVendor && !filteredVendors.some((v) => String(v.id) === currentVendor)) {
      form.setValue("vendorId", "");
    }
    const currentReq = form.getValues("requisitionId");
    if (
      currentReq &&
      !filteredRequisitions.some((r) => String(r.id) === currentReq) &&
      currentReq !== defaultRequisitionId
    ) {
      form.setValue("requisitionId", "");
    }
  }, [filteredVendors, filteredRequisitions, form, defaultRequisitionId]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        vendorId: data.vendorId,
        requisitionId: data.requisitionId,
        poNumber: data.poNumber.trim(),
        currency: data.currency.trim(),
        totalAmount: data.totalAmount.trim(),
        expectedDeliveryDate: data.expectedDeliveryDate,
      },
      {
        onSuccess: () => {
          toast.success("Purchase order created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
            requisitionId: defaultRequisitionId ?? "",
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create purchase order."),
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
                  form.setValue("requisitionId", defaultRequisitionId ?? "");
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
          <Label htmlFor="poNumber">PO number</Label>
          <Input id="poNumber" {...form.register("poNumber")} placeholder="PO-001" />
          {form.formState.errors.poNumber && (
            <p className="text-sm text-red-600">{form.formState.errors.poNumber.message}</p>
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
                  <SelectValue
                    placeholder={
                      !selectedTenantId ? "Select tenant first" : "Select requisition"
                    }
                  />
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
          {form.formState.errors.requisitionId && (
            <p className="text-sm text-red-600">{form.formState.errors.requisitionId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" {...form.register("currency")} placeholder="USD" />
          {form.formState.errors.currency && (
            <p className="text-sm text-red-600">{form.formState.errors.currency.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="totalAmount">Total amount</Label>
          <Input
            id="totalAmount"
            {...form.register("totalAmount")}
            placeholder="0.00"
          />
          {form.formState.errors.totalAmount && (
            <p className="text-sm text-red-600">{form.formState.errors.totalAmount.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="expectedDeliveryDate">Expected delivery</Label>
          <Input
            id="expectedDeliveryDate"
            type="date"
            {...form.register("expectedDeliveryDate")}
          />
          {form.formState.errors.expectedDeliveryDate && (
            <p className="text-sm text-red-600">
              {form.formState.errors.expectedDeliveryDate.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
