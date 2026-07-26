"use client";

import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateGoodsReceivedNote } from "@/presentation/hooks/useGoodsReceivedNotes";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useLocations } from "@/presentation/hooks/useLocations";
import { usePurchaseOrders } from "@/presentation/hooks/usePurchaseOrders";
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
  purchaseOrderId: z.string().min(1, "Purchase order is required"),
  receivingLocationId: z.string().min(1, "Receiving location is required"),
  grnNumber: z.string().min(1, "GRN number is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  purchaseOrderId: "",
  receivingLocationId: "",
  grnNumber: "",
};

export interface CreateGoodsReceivedNoteFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
  defaultPurchaseOrderId?: string;
}

function sessionUserId(session: ReturnType<typeof useSession>["data"]): string {
  return session?.user && "id" in session.user
    ? String((session.user as { id?: string }).id ?? "")
    : "";
}

export function CreateGoodsReceivedNoteForm({
  onSuccess,
  formId,
  onLoadingChange,
  defaultPurchaseOrderId,
}: CreateGoodsReceivedNoteFormProps) {
  const { data: session } = useSession();
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateGoodsReceivedNote();
  const toast = useToast();
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const locations = getPaginatedItems(locationsData);
  const { data: purchaseOrdersData } = usePurchaseOrders({ page: 1, limit: LIST_LIMIT });
  const purchaseOrders = getPaginatedItems(purchaseOrdersData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
      purchaseOrderId: defaultPurchaseOrderId ?? "",
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });

  const filteredLocations = useMemo(
    () =>
      locations.filter((l) => (selectedTenantId ? l.tenantId === selectedTenantId : false)),
    [locations, selectedTenantId]
  );

  const filteredPurchaseOrders = useMemo(
    () =>
      purchaseOrders.filter((po) =>
        selectedTenantId ? po.tenantId === selectedTenantId : false
      ),
    [purchaseOrders, selectedTenantId]
  );

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    if (defaultPurchaseOrderId) {
      form.setValue("purchaseOrderId", defaultPurchaseOrderId);
      const match = purchaseOrders.find(
        (po) => String(po.id) === defaultPurchaseOrderId,
      );
      if (match && !lockedTenantId) {
        form.setValue("tenantId", match.tenantId);
      }
    }
  }, [defaultPurchaseOrderId, purchaseOrders, lockedTenantId, form]);

  useEffect(() => {
    const currentLocation = form.getValues("receivingLocationId");
    if (currentLocation && !filteredLocations.some((l) => l.id === currentLocation)) {
      form.setValue("receivingLocationId", "");
    }
  }, [filteredLocations, form]);

  useEffect(() => {
    const currentPo = form.getValues("purchaseOrderId");
    if (
      currentPo &&
      currentPo !== defaultPurchaseOrderId &&
      !filteredPurchaseOrders.some((po) => po.id === currentPo)
    ) {
      form.setValue("purchaseOrderId", "");
    }
  }, [filteredPurchaseOrders, form, defaultPurchaseOrderId]);

  const onSubmit = (data: FormData) => {
    const receivedBy = sessionUserId(session).trim();
    if (!receivedBy) {
      toast.error("Sign in so we can send receivedBy.");
      return;
    }
    create.mutate(
      {
        tenantId: data.tenantId,
        purchaseOrderId: data.purchaseOrderId,
        receivingLocationId: data.receivingLocationId,
        grnNumber: data.grnNumber.trim(),
        receivedBy,
      },
      {
        onSuccess: () => {
          toast.success("Goods received note created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create goods received note."),
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
                  form.setValue("purchaseOrderId", "");
                  form.setValue("receivingLocationId", "");
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
          <Label htmlFor="grnNumber">GRN number</Label>
          <Input
            id="grnNumber"
            {...form.register("grnNumber")}
            placeholder="GRN-001"
          />
          {form.formState.errors.grnNumber && (
            <p className="text-sm text-red-600">{form.formState.errors.grnNumber.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="purchaseOrderId">Purchase order</Label>
          <Controller
            control={form.control}
            name="purchaseOrderId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedTenantId}
              >
                <SelectTrigger id="purchaseOrderId">
                  <SelectValue
                    placeholder={!selectedTenantId ? "Select tenant first" : "Select purchase order"}
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
          {form.formState.errors.purchaseOrderId && (
            <p className="text-sm text-red-600">{form.formState.errors.purchaseOrderId.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="receivingLocationId">Receiving location</Label>
          <Controller
            control={form.control}
            name="receivingLocationId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedTenantId}
              >
                <SelectTrigger id="receivingLocationId">
                  <SelectValue
                    placeholder={!selectedTenantId ? "Select tenant first" : "Select location"}
                  />
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
          {form.formState.errors.receivingLocationId && (
            <p className="text-sm text-red-600">
              {form.formState.errors.receivingLocationId.message}
            </p>
          )}
        </div>
      </div>

      {!session?.user && (
        <p className="text-xs text-muted">
          Sign in so we can send <code className="text-xs">receivedBy</code> when
          your API requires it.
        </p>
      )}
    </form>
  );
}
