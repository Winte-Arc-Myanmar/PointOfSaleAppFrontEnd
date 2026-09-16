"use client";

import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useCustomers } from "@/presentation/hooks/useCustomers";
import { useCardTiers } from "@/presentation/hooks/useCardTiers";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useLocations } from "@/presentation/hooks/useLocations";
import { usePosSessions } from "@/presentation/hooks/usePosSessions";
import { usePaymentMethods } from "@/presentation/hooks/usePaymentMethods";
import { useRegisterMembership } from "@/presentation/hooks/useMembershipMembers";
import { useToast } from "@/presentation/providers/ToastProvider";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { CardUidField } from "@/presentation/components/card-reader/CardUidField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const cardSchema = z.object({
  cardUid: z.string().min(1, "Card UID is required"),
  label: z.string(),
  roomNumber: z.string(),
});

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  customerId: z.string().min(1, "Customer is required"),
  tierId: z.string().min(1, "Card tier is required"),
  guestIdNumber: z.string(),
  locationId: z.string().min(1, "Location is required"),
  posSessionId: z.string().min(1, "POS session is required"),
  paymentMethodId: z.string().min(1, "Payment method is required"),
  paymentReference: z.string(),
  cards: z.array(cardSchema).min(1, "At least one card is required"),
  amount: z.number().min(0, "Amount must be zero or greater"),
  idempotencyKey: z.string(),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  customerId: "",
  tierId: "",
  guestIdNumber: "",
  locationId: "",
  posSessionId: "",
  paymentMethodId: "",
  paymentReference: "",
  cards: [{ cardUid: "", label: "Guest 1", roomNumber: "" }],
  amount: 0,
  idempotencyKey: "",
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
  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsData);
  const { data: posSessionsData } = usePosSessions({ page: 1, limit: 200 });
  const posSessions = getPaginatedItems(posSessionsData);
  const { data: paymentMethodsData } = usePaymentMethods({ page: 1, limit: 200 });
  const paymentMethods = getPaginatedItems(paymentMethodsData);
  const { data: cardTiersData } = useCardTiers({
    page: 1,
    limit: 200,
    sortBy: "rank",
    sortOrder: "asc",
  });
  const cardTiers = cardTiersData?.items ?? [];
  const lockCustomer = Boolean(defaultCustomerId);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? defaultTenantId ?? "",
      customerId: defaultCustomerId ?? "",
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cards",
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });

  const filteredCustomers = useMemo(
    () =>
      customers.filter((c) =>
        selectedTenantId ? String(c.tenantId) === String(selectedTenantId) : true,
      ),
    [customers, selectedTenantId],
  );

  const filteredTiers = useMemo(() => {
    if (!selectedTenantId) return [];
    return cardTiers.filter(
      (t) =>
        !t.tenantId || String(t.tenantId) === String(selectedTenantId),
    );
  }, [cardTiers, selectedTenantId]);
  const filteredLocations = useMemo(
    () =>
      locations.filter((item) =>
        selectedTenantId ? String(item.tenantId) === String(selectedTenantId) : true,
      ),
    [locations, selectedTenantId],
  );
  const filteredPaymentMethods = useMemo(
    () =>
      paymentMethods.filter((item) =>
        selectedTenantId ? String(item.tenantId) === String(selectedTenantId) : true,
      ),
    [paymentMethods, selectedTenantId],
  );
  const filteredPosSessions = useMemo(
    () =>
      posSessions.filter((item) =>
        selectedTenantId ? String(item.tenantId) === String(selectedTenantId) : true,
      ),
    [posSessions, selectedTenantId],
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

  useEffect(() => {
    const currentTierId = form.getValues("tierId");
    if (
      currentTierId &&
      !filteredTiers.some((tier) => String(tier.id) === String(currentTierId))
    ) {
      form.setValue("tierId", "");
    }
  }, [filteredTiers, form]);

  useEffect(() => {
    const nextKey =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`;
    if (!form.getValues("idempotencyKey")) {
      form.setValue("idempotencyKey", nextKey);
    }
  }, [form]);

  const submit = (data: FormData) => {
    const selectedCustomer = filteredCustomers.find(
      (c) => String(c.id) === String(data.customerId),
    );
    const selectedTier = filteredTiers.find(
      (t) => String(t.id) === String(data.tierId),
    );
    registerMembership.mutate(
      {
        tenantId: data.tenantId,
        customerId: data.customerId,
        tierId: data.tierId,
        customerName: selectedCustomer?.name,
        phone: selectedCustomer?.phone,
        email: selectedCustomer?.email,
        guestIdNumber: data.guestIdNumber.trim() || undefined,
        locationId: data.locationId,
        posSessionId: data.posSessionId,
        cards: data.cards.map((card, index) => ({
          cardUid: card.cardUid.trim(),
          label: card.label.trim() || `Guest ${index + 1}`,
          roomNumber: card.roomNumber.trim() || undefined,
        })),
        payment: {
          paymentMethodId: data.paymentMethodId,
          amount: data.amount || selectedTier?.preloadAmount || 0,
          reference: data.paymentReference.trim() || undefined,
        },
        idempotencyKey: data.idempotencyKey.trim() || undefined,
        cardTemplateName: selectedTier?.name,
        tier: selectedTier?.name,
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
          <Label htmlFor="tierId">Card tier</Label>
          <Controller
            control={form.control}
            name="tierId"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={(value) => {
                  field.onChange(value);
                  const tier = filteredTiers.find((t) => String(t.id) === value);
                  if (tier && !form.getValues("amount")) {
                    form.setValue("amount", tier.preloadAmount);
                  }
                }}
                disabled={!selectedTenantId}
              >
                <SelectTrigger id="tierId">
                  <SelectValue
                    placeholder={
                      !selectedTenantId
                        ? "Select tenant first"
                        : filteredTiers.length === 0
                          ? "No card tiers available"
                          : "Select card tier"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredTiers.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name} (rank {t.rank})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="guestIdNumber">Guest ID Number (optional)</Label>
          <Input id="guestIdNumber" {...form.register("guestIdNumber")} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="locationId">Location</Label>
          <Controller
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={!selectedTenantId}>
                <SelectTrigger id="locationId">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {filteredLocations.map((location) => (
                    <SelectItem key={location.id} value={String(location.id)}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="posSessionId">POS Session</Label>
          <Controller
            control={form.control}
            name="posSessionId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={!selectedTenantId}>
                <SelectTrigger id="posSessionId">
                  <SelectValue placeholder="Select POS session" />
                </SelectTrigger>
                <SelectContent>
                  {filteredPosSessions.map((session) => (
                    <SelectItem key={String(session.id)} value={String(session.id)}>
                      {String(session.id)} ({session.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="paymentMethodId">Payment Method</Label>
          <Controller
            control={form.control}
            name="paymentMethodId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={!selectedTenantId}>
                <SelectTrigger id="paymentMethodId">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {filteredPaymentMethods.map((pm) => (
                    <SelectItem key={String(pm.id)} value={String(pm.id)}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Label>Cards</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                cardUid: "",
                label: `Guest ${fields.length + 1}`,
                roomNumber: "",
              })
            }
          >
            <Plus className="size-4" />
            Add card
          </Button>
        </div>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 gap-3 rounded-lg border border-border p-3 sm:grid-cols-4"
          >
            <div className="grid gap-2 sm:col-span-1">
              <Label htmlFor={`cards.${index}.cardUid`}>Card UID</Label>
              <Controller
                control={form.control}
                name={`cards.${index}.cardUid`}
                render={({ field }) => (
                  <CardUidField
                    id={`cards.${index}.cardUid`}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="04A3B2C1"
                  />
                )}
              />
            </div>
            <div className="grid gap-2 sm:col-span-1">
              <Label htmlFor={`cards.${index}.label`}>Label</Label>
              <Input
                id={`cards.${index}.label`}
                {...form.register(`cards.${index}.label`)}
                placeholder={`Guest ${index + 1}`}
              />
            </div>
            <div className="grid gap-2 sm:col-span-1">
              <Label htmlFor={`cards.${index}.roomNumber`}>Room</Label>
              <Input
                id={`cards.${index}.roomNumber`}
                {...form.register(`cards.${index}.roomNumber`)}
                placeholder="304"
              />
            </div>
            <div className="flex items-end sm:col-span-1">
              <Button
                type="button"
                variant="ghost"
                disabled={fields.length <= 1}
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            min={0}
            step="0.01"
            {...form.register("amount", { valueAsNumber: true })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="paymentReference">Payment Reference (optional)</Label>
          <Input id="paymentReference" {...form.register("paymentReference")} placeholder="KBZ-99182736" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="idempotencyKey">Idempotency Key</Label>
        <Input id="idempotencyKey" {...form.register("idempotencyKey")} />
      </div>
    </form>
  );
}
