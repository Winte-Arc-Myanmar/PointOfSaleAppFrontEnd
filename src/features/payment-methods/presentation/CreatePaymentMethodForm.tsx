"use client";

import { useEffect } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { apiErrorMessage } from "@/lib/api-error";
import {
  PaymentMethodFields,
  paymentMethodFieldsSchema,
  type PaymentMethodFieldValues,
} from "./PaymentMethodFields";
import { useCreatePaymentMethod } from "@/presentation/hooks/usePaymentMethods";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

const schema = paymentMethodFieldsSchema.extend({
  tenantId: z.string().min(1, "Tenant is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  name: "",
  kind: "CASH",
  glAccountId: "",
  isActive: true,
};

export interface CreatePaymentMethodFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreatePaymentMethodForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreatePaymentMethodFormProps) {
  const create = useCreatePaymentMethod();
  const toast = useToast();
  const { tenantId: lockedTenantId } = usePermissions();
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues, tenantId: lockedTenantId ?? "" },
  });
  const kind = useWatch({ control: form.control, name: "kind" });

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        name: data.name.trim(),
        kind: data.kind,
        isActive: data.isActive,
        glAccountId: data.glAccountId || null,
      },
      {
        onSuccess: () => {
          toast.success("Payment method created.");
          form.reset({ ...defaultValues, tenantId: lockedTenantId ?? "" });
          onSuccess?.();
        },
        onError: (error) =>
          toast.error(apiErrorMessage(error, "Failed to create payment method.")),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {!lockedTenantId ? (
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
      ) : null}

      <PaymentMethodFields
        control={form.control as unknown as Control<PaymentMethodFieldValues>}
        register={form.register as unknown as UseFormRegister<PaymentMethodFieldValues>}
        errors={form.formState.errors}
        kind={kind}
      />

      {!formId && (
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Create Payment Method"}
        </Button>
      )}
    </form>
  );
}
