"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/presentation/providers/ToastProvider";
import { AppLoader } from "@/presentation/components/loader";
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
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useCustomer, useUpdateCustomer } from "@/presentation/hooks/useCustomers";
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

type CustomerFormData = z.infer<typeof schema>;

const REDIRECT_DELAY_MS = 1500;

export function EditCustomerForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const { tenantId: lockedTenantId } = usePermissions();
  const { data: customer, isLoading, error } = useCustomer(customerId);
  const { data: tenants = [], isLoading: isTenantsLoading } = useTenants();
  const updateCustomer = useUpdateCustomer();
  const toast = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      tenantId: "",
      phone: "",
      email: "",
      accountType: "RETAIL",
      hasCreditAccount: false,
      maxCreditLimit: "0.0000",
      paymentTermsDays: 0,
      loyaltyTier: "BRONZE",
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        tenantId: customer.tenantId,
        phone: customer.phone ?? "",
        email: customer.email ?? "",
        accountType: customer.accountType ?? "RETAIL",
        hasCreditAccount: Boolean(customer.hasCreditAccount),
        maxCreditLimit: customer.maxCreditLimit ?? "0.0000",
        paymentTermsDays: customer.paymentTermsDays ?? 0,
        loyaltyTier: customer.loyaltyTier ?? "BRONZE",
      });
    }
  }, [customer, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const hasCreditAccount = useWatch({ control: form.control, name: "hasCreditAccount" });
  const creditDisabled = useMemo(() => !hasCreditAccount, [hasCreditAccount]);

  useEffect(() => {
    if (!hasCreditAccount) {
      form.setValue("maxCreditLimit", "0.0000");
      form.setValue("paymentTermsDays", 0);
    }
  }, [hasCreditAccount, form]);

  const onSubmit = (data: CustomerFormData) => {
    setShowSuccess(false);
    updateCustomer.mutate(
      {
        id: customerId,
        data: {
          name: data.name,
          tenantId: data.tenantId,
          phone: data.phone,
          email: data.email,
          accountType: data.accountType,
          hasCreditAccount: data.hasCreditAccount,
          maxCreditLimit: data.maxCreditLimit || "0.0000",
          paymentTermsDays: data.paymentTermsDays ?? 0,
          loyaltyTier: data.loyaltyTier,
          currentCreditBalance: customer?.currentCreditBalance ?? "0.0000",
          lifetimePointsEarned: customer?.lifetimePointsEarned ?? 0,
        },
      },
      {
        onSuccess: () => {
          toast.success("Customer updated.");
          form.reset(form.getValues());
          setShowSuccess(true);
          setTimeout(() => router.push("/customers"), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update customer."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;

  if (error || !customer)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Customer not found.</p>
        <Link href="/customers">
          <Button variant="outline">Back to Customers</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit customer</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tenantId">Tenant</Label>
            <Controller
              control={form.control}
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
            {form.formState.errors.tenantId && (
              <p className="text-sm text-red-600">{form.formState.errors.tenantId.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="accountType">Account type</Label>
            <Controller
              control={form.control}
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="loyaltyTier">Loyalty tier</Label>
            <Controller
              control={form.control}
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
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="hasCreditAccount">Has credit account</Label>
            <Controller
              control={form.control}
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
          <div className="grid gap-2">
            <Label htmlFor="paymentTermsDays">Payment terms (days)</Label>
            <Input
              id="paymentTermsDays"
              type="number"
              {...form.register("paymentTermsDays", { valueAsNumber: true })}
              disabled={creditDisabled}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="maxCreditLimit">Max credit limit</Label>
          <Input
            id="maxCreditLimit"
            {...form.register("maxCreditLimit")}
            disabled={creditDisabled}
          />
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Customer updated. Redirecting...
          </p>
        )}
        {updateCustomer.isError && (
          <p className="text-sm text-red-600">Failed to update customer.</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={updateCustomer.isPending}>
            {updateCustomer.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href="/customers">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

