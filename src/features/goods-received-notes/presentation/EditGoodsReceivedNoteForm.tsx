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
  useGoodsReceivedNote,
  useUpdateGoodsReceivedNote,
} from "@/presentation/hooks/useGoodsReceivedNotes";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useLocations } from "@/presentation/hooks/useLocations";
import { usePurchaseOrders } from "@/presentation/hooks/usePurchaseOrders";
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
  purchaseOrderId: z.string().min(1, "Purchase order is required"),
  receivingLocationId: z.string().min(1, "Receiving location is required"),
  grnNumber: z.string().min(1, "GRN number is required"),
});

type FormData = z.infer<typeof schema>;

function sessionUserId(session: ReturnType<typeof useSession>["data"]): string {
  return session?.user && "id" in session.user
    ? String((session.user as { id?: string }).id ?? "")
    : "";
}

export function EditGoodsReceivedNoteForm({ grnId }: { grnId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data: session } = useSession();
  const { tenantId: lockedTenantId } = usePermissions();
  const update = useUpdateGoodsReceivedNote();
  const { data: note, isLoading, error } = useGoodsReceivedNote(grnId);
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: locationsData } = useLocations({ page: 1, limit: LIST_LIMIT });
  const locations = getPaginatedItems(locationsData);
  const { data: purchaseOrdersData } = usePurchaseOrders({ page: 1, limit: LIST_LIMIT });
  const purchaseOrders = getPaginatedItems(purchaseOrdersData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      purchaseOrderId: "",
      receivingLocationId: "",
      grnNumber: "",
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
    if (note) {
      form.reset({
        tenantId: note.tenantId,
        purchaseOrderId: note.purchaseOrderId,
        receivingLocationId: note.receivingLocationId,
        grnNumber: note.grnNumber,
      });
    }
  }, [note, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    const receivedBy =
      sessionUserId(session).trim() || note?.receivedBy?.trim() || "";
    if (!receivedBy) {
      toast.error("Sign in so we can send receivedBy.");
      return;
    }
    update.mutate(
      {
        id: grnId,
        data: {
          tenantId: data.tenantId,
          purchaseOrderId: data.purchaseOrderId,
          receivingLocationId: data.receivingLocationId,
          grnNumber: data.grnNumber.trim(),
          receivedBy,
        },
      },
      {
        onSuccess: () => {
          toast.success("Goods received note updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/goods-received-notes/${grnId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update goods received note."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !note) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Goods received note not found.</p>
        <Link href="/goods-received-notes">
          <Button variant="outline">Back to Goods Received Notes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/goods-received-notes/${grnId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit goods received note</h1>
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
            <Label htmlFor="grnNumber">GRN number</Label>
            <Input id="grnNumber" {...form.register("grnNumber")} />
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
                    <SelectValue placeholder="Select purchase order" />
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
                    <SelectValue placeholder="Select location" />
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
          <Label htmlFor="receivedBy">Received by</Label>
          <Input
            id="receivedBy"
            value={sessionUserId(session) || note.receivedBy}
            readOnly
            disabled
          />
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Goods received note updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/goods-received-notes/${grnId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
