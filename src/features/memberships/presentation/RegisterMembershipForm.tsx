"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useCustomers } from "@/presentation/hooks/useCustomers";
import { useMembershipCardTemplates } from "@/presentation/hooks/useMembershipCardTemplates";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useRegisterMembership } from "@/presentation/hooks/useMembershipMembers";
import { useToast } from "@/presentation/providers/ToastProvider";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  customerId: z.string().min(1, "Customer is required"),
  cardTemplateId: z.string().min(1, "Card template is required"),
  cardNumber: z.string(),
  initialTopup: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  customerId: "",
  cardTemplateId: "",
  cardNumber: "",
  initialTopup: 0,
};

export function RegisterMembershipForm({
  formId,
  onSuccess,
  onLoadingChange,
  defaultCustomerId,
  defaultTenantId,
}: {
  formId?: string;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  defaultCustomerId?: string;
  defaultTenantId?: string;
}) {
  const { tenantId: lockedTenantId } = usePermissions();
  const toast = useToast();
  const registerMembership = useRegisterMembership();
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: customersData } = useCustomers({ page: 1, limit: 200 });
  const customers = getPaginatedItems(customersData);
  const { data: templatesData } = useMembershipCardTemplates({
    page: 1,
    limit: 200,
  });
  const templates = templatesData?.items ?? [];
  const lockCustomer = Boolean(defaultCustomerId);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? defaultTenantId ?? "",
      customerId: defaultCustomerId ?? "",
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });

  const filteredCustomers = useMemo(
    () =>
      customers.filter((c) =>
        selectedTenantId ? String(c.tenantId) === String(selectedTenantId) : true,
      ),
    [customers, selectedTenantId],
  );

  const filteredTemplates = useMemo(
    () =>
      templates.filter((t) =>
        selectedTenantId ? String(t.tenantId) === String(selectedTenantId) : true,
      ),
    [templates, selectedTenantId],
  );

  useEffect(() => {
    onLoadingChange?.(registerMembership.isPending);
  }, [registerMembership.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
    else if (defaultTenantId) form.setValue("tenantId", defaultTenantId);
  }, [lockedTenantId, defaultTenantId, form]);

  useEffect(() => {
    if (defaultCustomerId) form.setValue("customerId", defaultCustomerId);
  }, [defaultCustomerId, form]);

  const submit = (data: FormData) => {
    const selectedCustomer = filteredCustomers.find(
      (c) => String(c.id) === String(data.customerId),
    );
    registerMembership.mutate(
      {
        tenantId: data.tenantId,
        customerId: data.customerId,
        cardTemplateId: data.cardTemplateId,
        cardNumber: data.cardNumber.trim() || null,
        initialTopup: data.initialTopup,
        customerName: selectedCustomer?.name,
        phone: selectedCustomer?.phone,
        email: selectedCustomer?.email,
      },
      {
        onSuccess: () => {
          toast.success("Membership registered.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to register membership."),
      },
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(submit)} className="space-y-4">
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
          <Label htmlFor="customerId">Customer</Label>
          <Controller
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedTenantId || lockCustomer}
              >
                <SelectTrigger id="customerId">
                  <SelectValue
                    placeholder={
                      !selectedTenantId ? "Select tenant first" : "Select customer"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredCustomers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
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
          <Label htmlFor="cardTemplateId">Card template</Label>
          <Controller
            control={form.control}
            name="cardTemplateId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedTenantId}
              >
                <SelectTrigger id="cardTemplateId">
                  <SelectValue placeholder="Select card template" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTemplates.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name} ({t.tier})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cardNumber">Card number (optional)</Label>
          <Input
            id="cardNumber"
            {...form.register("cardNumber")}
            placeholder="Leave empty to bind later"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="initialTopup">Initial topup</Label>
        <Input
          id="initialTopup"
          type="number"
          min={0}
          step="0.01"
          {...form.register("initialTopup", { valueAsNumber: true })}
        />
      </div>
    </form>
  );
}
