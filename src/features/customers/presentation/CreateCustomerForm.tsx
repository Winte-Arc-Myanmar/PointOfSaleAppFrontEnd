"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCustomer } from "@/presentation/hooks/useCustomers";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePermissions } from "@/presentation/hooks/usePermissions";
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
import { CUSTOMER_ACCOUNT_TYPES, CUSTOMER_LOYALTY_TIERS } from "./customer-constants";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  phone: z.string(),
  email: z.string(),
  accountType: z.string().min(1, "Account type is required"),
  hasCreditAccount: z.boolean(),
  maxCreditLimit: z.string(),
  paymentTermsDays: z.number().min(0),
  loyaltyTier: z.string().min(1, "Loyalty tier is required"),
});

export type CustomerFormData = z.infer<typeof schema>;

const defaultValues: CustomerFormData = {
  name: "",
  tenantId: "",
  phone: "",
  email: "",
  accountType: "RETAIL",
  hasCreditAccount: false,
  maxCreditLimit: "0.0000",
  paymentTermsDays: 0,
  loyaltyTier: "BRONZE",
};

function defaultTenantValues(lockedTenantId: string | undefined) {
  return { ...defaultValues, tenantId: lockedTenantId ?? "" };
}

export interface CreateCustomerFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateCustomerForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateCustomerFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const createCustomer = useCreateCustomer();
  const toast = useToast();
  const { data: tenants = [], isLoading: isTenantsLoading } = useTenants();

  useEffect(() => {
    onLoadingChange?.(createCustomer.isPending ?? false);
  }, [createCustomer.isPending, onLoadingChange]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultTenantValues(lockedTenantId),
  });

  useEffect(() => {
    if (lockedTenantId) setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, setValue]);

  const hasCreditAccount = useWatch({ control, name: "hasCreditAccount" });

  const creditDisabled = useMemo(
    () => !hasCreditAccount,
    [hasCreditAccount]
  );

  useEffect(() => {
    if (!hasCreditAccount) {
      setValue("maxCreditLimit", "0.0000");
      setValue("paymentTermsDays", 0);
    }
  }, [hasCreditAccount, setValue]);

  const onSubmit = (data: CustomerFormData) => {
    createCustomer.mutate(
      {
        name: data.name,
        tenantId: data.tenantId,
        phone: data.phone,
        email: data.email,
        accountType: data.accountType,
        hasCreditAccount: data.hasCreditAccount,
        maxCreditLimit: data.maxCreditLimit || "0.0000",
        paymentTermsDays: data.paymentTermsDays ?? 0,
        loyaltyTier: data.loyaltyTier,
        currentCreditBalance: "0.0000",
        lifetimePointsEarned: 0,
      },
      {
        onSuccess: () => {
          toast.success("Customer created.");
          reset({
            ...defaultTenantValues(lockedTenantId),
            tenantId: lockedTenantId ?? getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create customer."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="e.g. Walk-In Customer" />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tenantId">Tenant</Label>
          <Controller
            control={control}
            name="tenantId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isTenantsLoading || Boolean(lockedTenantId)}
              >
                <SelectTrigger id="tenantId">
                  <SelectValue placeholder={isTenantsLoading ? "Loading tenants..." : "Select tenant"} />
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
          {errors.tenantId && (
            <p className="text-sm text-red-600">{errors.tenantId.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="accountType">Account type</Label>
          <Controller
            control={control}
            name="accountType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="accountType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.accountType && (
            <p className="text-sm text-red-600">{errors.accountType.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} placeholder="e.g. 09123456789" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} placeholder="customer@example.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="loyaltyTier">Loyalty tier</Label>
          <Controller
            control={control}
            name="loyaltyTier"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="loyaltyTier">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_LOYALTY_TIERS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.loyaltyTier && (
            <p className="text-sm text-red-600">{errors.loyaltyTier.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="hasCreditAccount">Has credit account</Label>
          <Controller
            control={control}
            name="hasCreditAccount"
            render={({ field }) => (
              <Select
                value={field.value ? "true" : "false"}
                onValueChange={(v) => field.onChange(v === "true")}
              >
                <SelectTrigger id="hasCreditAccount">
                  <SelectValue placeholder="Select" />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="maxCreditLimit">Max credit limit</Label>
          <Input
            id="maxCreditLimit"
            {...register("maxCreditLimit")}
            disabled={creditDisabled}
            placeholder="e.g. 5000.0000"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="paymentTermsDays">Payment terms (days)</Label>
          <Input
            id="paymentTermsDays"
            type="number"
            {...register("paymentTermsDays", { valueAsNumber: true })}
            disabled={creditDisabled}
          />
          {errors.paymentTermsDays && (
            <p className="text-sm text-red-600">{errors.paymentTermsDays.message}</p>
          )}
        </div>
      </div>

      {createCustomer.isError && (
        <p className="text-sm text-red-600">
          Failed to create customer. Please try again.
        </p>
      )}

      {!formId && (
        <Button type="submit" disabled={createCustomer.isPending}>
          {createCustomer.isPending ? "Creating..." : "Create Customer"}
        </Button>
      )}
    </form>
  );
}

