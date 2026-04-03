"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
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
import {
  useLoyaltyLedgerEntry,
  useUpdateLoyaltyLedgerEntry,
} from "@/presentation/hooks/useLoyaltyLedger";
import { LOYALTY_TRANSACTION_TYPES } from "./loyalty-ledger-constants";

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  transactionType: z.string().min(1, "Transaction type is required"),
  points: z.number().int(),
  referenceOrderId: z.string(),
  expiryDate: z.string(),
});

type FormData = z.infer<typeof schema>;

const REDIRECT_DELAY_MS = 1500;

export interface EditLoyaltyLedgerFormProps {
  customerId: string;
  entryId: string;
  listHref?: string;
}

export function EditLoyaltyLedgerForm({
  customerId,
  entryId,
  listHref: listHrefProp,
}: EditLoyaltyLedgerFormProps) {
  const router = useRouter();
  const { tenantId: lockedTenantId } = usePermissions();
  const { data: entry, isLoading, error } = useLoyaltyLedgerEntry(
    customerId,
    entryId
  );
  const { data: tenants = [], isLoading: isTenantsLoading } = useTenants();
  const updateEntry = useUpdateLoyaltyLedgerEntry();
  const toast = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const listHref =
    listHrefProp ?? `/customers/${customerId}/loyalty-ledger`;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      transactionType: "EARN",
      points: 0,
      referenceOrderId: "",
      expiryDate: "",
    },
  });

  useEffect(() => {
    if (entry) {
      form.reset({
        tenantId: entry.tenantId,
        transactionType: entry.transactionType,
        points: entry.points,
        referenceOrderId: entry.referenceOrderId ?? "",
        expiryDate: entry.expiryDate ?? "",
      });
    }
  }, [entry, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    updateEntry.mutate(
      {
        customerId,
        entryId,
        data: {
          tenantId: data.tenantId,
          transactionType: data.transactionType,
          points: data.points,
          referenceOrderId: data.referenceOrderId.trim() || undefined,
          expiryDate: data.expiryDate.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Loyalty entry updated.");
          form.reset(form.getValues());
          setShowSuccess(true);
          setTimeout(() => router.push(listHref), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update loyalty entry."),
      }
    );
  };

  if (isLoading)
    return <AppLoader fullScreen={false} size="sm" message="Loading..." />;

  if (error || !entry)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Entry not found.</p>
        <Link href={listHref}>
          <Button variant="outline">Back to ledger</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={listHref}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">
          Edit loyalty entry
        </h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
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
                  <SelectValue
                    placeholder={
                      isTenantsLoading ? "Loading tenants..." : "Select tenant"
                    }
                  />
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
            <p className="text-sm text-red-600">
              {form.formState.errors.tenantId.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="transactionType">Transaction type</Label>
            <Controller
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="transactionType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOYALTY_TRANSACTION_TYPES.map((t) => (
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
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              {...form.register("points", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="referenceOrderId">Reference order ID (optional)</Label>
          <Input id="referenceOrderId" {...form.register("referenceOrderId")} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="expiryDate">Expiry date (optional)</Label>
          <Input id="expiryDate" type="date" {...form.register("expiryDate")} />
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Loyalty entry updated. Redirecting...
          </p>
        )}
        {updateEntry.isError && (
          <p className="text-sm text-red-600">Failed to update loyalty entry.</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={updateEntry.isPending}>
            {updateEntry.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={listHref}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
