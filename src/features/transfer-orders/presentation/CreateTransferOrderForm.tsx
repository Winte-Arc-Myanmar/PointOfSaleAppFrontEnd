"use client";

import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTransferOrder } from "@/presentation/hooks/useTransferOrders";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useLocations } from "@/presentation/hooks/useLocations";
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
  sourceLocationId: z.string().min(1, "Source location is required"),
  transitLocationId: z.string().min(1, "Transit location is required"),
  destinationLocationId: z.string().min(1, "Destination location is required"),
  transferNumber: z.string().min(1, "Transfer number is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  sourceLocationId: "",
  transitLocationId: "",
  destinationLocationId: "",
  transferNumber: "",
};

export interface CreateTransferOrderFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

function sessionUserId(session: ReturnType<typeof useSession>["data"]): string {
  return session?.user && "id" in session.user
    ? String((session.user as { id?: string }).id ?? "")
    : "";
}

export function CreateTransferOrderForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateTransferOrderFormProps) {
  const { data: session } = useSession();
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateTransferOrder();
  const toast = useToast();
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const locations = getPaginatedItems(locationsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });

  const filteredLocations = useMemo(
    () =>
      locations.filter((l) => (selectedTenantId ? l.tenantId === selectedTenantId : false)),
    [locations, selectedTenantId]
  );

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    const fields = ["sourceLocationId", "transitLocationId", "destinationLocationId"] as const;
    for (const field of fields) {
      const current = form.getValues(field);
      if (current && !filteredLocations.some((l) => l.id === current)) {
        form.setValue(field, "");
      }
    }
  }, [filteredLocations, form]);

  const onSubmit = (data: FormData) => {
    const createdBy = sessionUserId(session).trim();
    if (!createdBy) {
      toast.error("Sign in so we can send createdBy.");
      return;
    }
    create.mutate(
      {
        tenantId: data.tenantId,
        sourceLocationId: data.sourceLocationId,
        transitLocationId: data.transitLocationId,
        destinationLocationId: data.destinationLocationId,
        transferNumber: data.transferNumber.trim(),
        createdBy,
      },
      {
        onSuccess: () => {
          toast.success("Transfer order created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create transfer order."),
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
                  form.setValue("sourceLocationId", "");
                  form.setValue("transitLocationId", "");
                  form.setValue("destinationLocationId", "");
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
          <Label htmlFor="transferNumber">Transfer number</Label>
          <Input
            id="transferNumber"
            {...form.register("transferNumber")}
            placeholder="TO-001"
          />
          {form.formState.errors.transferNumber && (
            <p className="text-sm text-red-600">{form.formState.errors.transferNumber.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="sourceLocationId">Source location</Label>
          <Controller
            control={form.control}
            name="sourceLocationId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedTenantId}
              >
                <SelectTrigger id="sourceLocationId">
                  <SelectValue
                    placeholder={!selectedTenantId ? "Select tenant first" : "Select source"}
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
          {form.formState.errors.sourceLocationId && (
            <p className="text-sm text-red-600">{form.formState.errors.sourceLocationId.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="transitLocationId">Transit location</Label>
          <Controller
            control={form.control}
            name="transitLocationId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedTenantId}
              >
                <SelectTrigger id="transitLocationId">
                  <SelectValue
                    placeholder={!selectedTenantId ? "Select tenant first" : "Select transit"}
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
          {form.formState.errors.transitLocationId && (
            <p className="text-sm text-red-600">{form.formState.errors.transitLocationId.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="destinationLocationId">Destination location</Label>
          <Controller
            control={form.control}
            name="destinationLocationId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedTenantId}
              >
                <SelectTrigger id="destinationLocationId">
                  <SelectValue
                    placeholder={!selectedTenantId ? "Select tenant first" : "Select destination"}
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
          {form.formState.errors.destinationLocationId && (
            <p className="text-sm text-red-600">
              {form.formState.errors.destinationLocationId.message}
            </p>
          )}
        </div>
      </div>

      {!session?.user && (
        <p className="text-xs text-muted">
          Sign in so we can send <code className="text-xs">createdBy</code> when
          your API requires it.
        </p>
      )}
    </form>
  );
}
