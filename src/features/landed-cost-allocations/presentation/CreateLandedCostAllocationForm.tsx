"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateLandedCostAllocation } from "@/presentation/hooks/useLandedCostAllocations";
import { useVendorInvoices } from "@/presentation/hooks/useVendorInvoices";
import { useGoodsReceivedNotes } from "@/presentation/hooks/useGoodsReceivedNotes";
import { useGrnLines } from "@/presentation/hooks/useGrnLines";
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

const defaultValues: FormData = {
  tenantId: "",
  sourceInvoiceId: "",
  targetGrnId: "",
  targetGrnLineId: "",
  allocationMethod: "BY_VALUE",
  allocatedAmount: "0.00",
  glJournalPosted: false,
};

export interface CreateLandedCostAllocationFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
  defaultSourceInvoiceId?: string;
  defaultGrnId?: string;
}

export function CreateLandedCostAllocationForm({
  onSuccess,
  formId,
  onLoadingChange,
  defaultSourceInvoiceId,
  defaultGrnId,
}: CreateLandedCostAllocationFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateLandedCostAllocation();
  const toast = useToast();
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: invoicesData } = useVendorInvoices({ page: 1, limit: LIST_LIMIT });
  const invoices = getPaginatedItems(invoicesData);
  const { data: grnsData } = useGoodsReceivedNotes({ page: 1, limit: LIST_LIMIT });
  const grns = getPaginatedItems(grnsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
      sourceInvoiceId: defaultSourceInvoiceId ?? "",
      targetGrnId: defaultGrnId ?? "",
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
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    if (defaultSourceInvoiceId) {
      form.setValue("sourceInvoiceId", defaultSourceInvoiceId);
      const match = invoices.find((inv) => String(inv.id) === defaultSourceInvoiceId);
      if (match && !lockedTenantId) {
        form.setValue("tenantId", match.tenantId);
      }
    }
  }, [defaultSourceInvoiceId, invoices, lockedTenantId, form]);

  useEffect(() => {
    if (defaultGrnId) {
      form.setValue("targetGrnId", defaultGrnId);
      const match = grns.find((g) => String(g.id) === defaultGrnId);
      if (match && !lockedTenantId) {
        form.setValue("tenantId", match.tenantId);
      }
    }
  }, [defaultGrnId, grns, lockedTenantId, form]);

  useEffect(() => {
    const currentInvoice = form.getValues("sourceInvoiceId");
    if (
      currentInvoice &&
      currentInvoice !== defaultSourceInvoiceId &&
      !filteredInvoices.some((inv) => String(inv.id) === currentInvoice)
    ) {
      form.setValue("sourceInvoiceId", "");
    }
    const currentGrn = form.getValues("targetGrnId");
    if (
      currentGrn &&
      currentGrn !== defaultGrnId &&
      !filteredGrns.some((g) => String(g.id) === currentGrn)
    ) {
      form.setValue("targetGrnId", "");
      form.setValue("targetGrnLineId", "");
    }
  }, [filteredInvoices, filteredGrns, form, defaultSourceInvoiceId, defaultGrnId]);

  useEffect(() => {
    const currentLine = form.getValues("targetGrnLineId");
    if (
      currentLine &&
      grnLines.length > 0 &&
      !grnLines.some((line) => String(line.id) === currentLine)
    ) {
      form.setValue("targetGrnLineId", "");
    }
  }, [grnLines, form]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        sourceInvoiceId: data.sourceInvoiceId,
        targetGrnId: data.targetGrnId,
        targetGrnLineId: data.targetGrnLineId.trim(),
        allocationMethod: data.allocationMethod,
        allocatedAmount: data.allocatedAmount.trim(),
        glJournalPosted: data.glJournalPosted,
      },
      {
        onSuccess: () => {
          toast.success("Landed cost allocation created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
            sourceInvoiceId: defaultSourceInvoiceId ?? "",
            targetGrnId: defaultGrnId ?? "",
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create landed cost allocation."),
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
                  form.setValue("sourceInvoiceId", defaultSourceInvoiceId ?? "");
                  form.setValue("targetGrnId", defaultGrnId ?? "");
                  form.setValue("targetGrnLineId", "");
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
                  <SelectValue
                    placeholder={
                      !selectedTenantId ? "Select tenant first" : "Select invoice"
                    }
                  />
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
          {form.formState.errors.sourceInvoiceId && (
            <p className="text-sm text-red-600">
              {form.formState.errors.sourceInvoiceId.message}
            </p>
          )}
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
          {form.formState.errors.targetGrnId && (
            <p className="text-sm text-red-600">
              {form.formState.errors.targetGrnId.message}
            </p>
          )}
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
              placeholder={
                selectedGrnId
                  ? "Enter GRN line UUID"
                  : "Select GRN first or enter line UUID"
              }
              disabled={!selectedGrnId}
            />
          )}
          {form.formState.errors.targetGrnLineId && (
            <p className="text-sm text-red-600">
              {form.formState.errors.targetGrnLineId.message}
            </p>
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
          {form.formState.errors.allocationMethod && (
            <p className="text-sm text-red-600">
              {form.formState.errors.allocationMethod.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="allocatedAmount">Allocated amount</Label>
          <Input
            id="allocatedAmount"
            {...form.register("allocatedAmount")}
            placeholder="0.00"
          />
          {form.formState.errors.allocatedAmount && (
            <p className="text-sm text-red-600">
              {form.formState.errors.allocatedAmount.message}
            </p>
          )}
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
    </form>
  );
}
