"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useTransferOrder,
  useUpdateTransferOrder,
} from "@/presentation/hooks/useTransferOrders";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useLocations } from "@/presentation/hooks/useLocations";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

const REDIRECT_DELAY_MS = 1500;
const LIST_LIMIT = 200;

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  sourceLocationId: z.string().min(1, "Source location is required"),
  transitLocationId: z.string().min(1, "Transit location is required"),
  destinationLocationId: z.string().min(1, "Destination location is required"),
  transferNumber: z.string().min(1, "Transfer number is required"),
});

type FormData = z.infer<typeof schema>;

function sessionUserId(session: ReturnType<typeof useSession>["data"]): string {
  return session?.user && "id" in session.user
    ? String((session.user as { id?: string }).id ?? "")
    : "";
}

export function EditTransferOrderForm({ transferOrderId }: { transferOrderId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data: session } = useSession();
  const { tenantId: lockedTenantId } = usePermissions();
  const update = useUpdateTransferOrder();
  const { data: order, isLoading, error } = useTransferOrder(transferOrderId);
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const locations = getPaginatedItems(locationsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      sourceLocationId: "",
      transitLocationId: "",
      destinationLocationId: "",
      transferNumber: "",
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });

  const filteredLocations = useMemo(
    () =>
      locations.filter((l) => (selectedTenantId ? l.tenantId === selectedTenantId : false)),
    [locations, selectedTenantId]
  );

  useEffect(() => {
    if (order) {
      form.reset({
        tenantId: order.tenantId,
        sourceLocationId: order.sourceLocationId,
        transitLocationId: order.transitLocationId,
        destinationLocationId: order.destinationLocationId,
        transferNumber: order.transferNumber,
      });
    }
  }, [order, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    const createdBy =
      sessionUserId(session).trim() || order?.createdBy?.trim() || "";
    if (!createdBy) {
      toast.error("Sign in so we can send createdBy.");
      return;
    }
    update.mutate(
      {
        id: transferOrderId,
        data: {
          tenantId: data.tenantId,
          sourceLocationId: data.sourceLocationId,
          transitLocationId: data.transitLocationId,
          destinationLocationId: data.destinationLocationId,
          transferNumber: data.transferNumber.trim(),
          createdBy,
        },
      },
      {
        onSuccess: () => {
          toast.success("Transfer order updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/transfer-orders/${transferOrderId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update transfer order."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !order) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Transfer order not found.</p>
        <Link href="/transfer-orders">
          <Button variant="outline">Back to Transfer Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/transfer-orders/${transferOrderId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit transfer order</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
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
            <Label htmlFor="transferNumber">Transfer number</Label>
            <Input id="transferNumber" {...form.register("transferNumber")} />
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
                    <SelectValue placeholder="Select source" />
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
                    <SelectValue placeholder="Select transit" />
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
                    <SelectValue placeholder="Select destination" />
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
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="createdBy">Created by</Label>
          <Input
            id="createdBy"
            value={sessionUserId(session) || order.createdBy}
            readOnly
            disabled
          />
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Transfer order updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/transfer-orders/${transferOrderId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
