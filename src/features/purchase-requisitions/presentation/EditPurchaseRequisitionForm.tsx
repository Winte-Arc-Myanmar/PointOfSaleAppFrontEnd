"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  usePurchaseRequisition,
  useUpdatePurchaseRequisition,
} from "@/presentation/hooks/usePurchaseRequisitions";
import { useTenants } from "@/presentation/hooks/useTenants";
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

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  department: z.string().min(1, "Department is required"),
  justification: z.string().min(1, "Justification is required"),
});

type FormData = z.infer<typeof schema>;

const textAreaClass =
  "flex min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tracking-[0.02em] text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

function sessionUserId(session: ReturnType<typeof useSession>["data"]): string {
  return session?.user && "id" in session.user
    ? String((session.user as { id?: string }).id ?? "")
    : "";
}

export function EditPurchaseRequisitionForm({
  purchaseRequisitionId,
}: {
  purchaseRequisitionId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const { data: session } = useSession();
  const { tenantId: lockedTenantId } = usePermissions();
  const update = useUpdatePurchaseRequisition();
  const { data: requisition, isLoading, error } =
    usePurchaseRequisition(purchaseRequisitionId);
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      department: "",
      justification: "",
    },
  });

  useEffect(() => {
    if (requisition) {
      form.reset({
        tenantId: requisition.tenantId,
        department: requisition.department,
        justification: requisition.justification,
      });
    }
  }, [requisition, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    const requestedBy =
      sessionUserId(session).trim() || requisition?.requestedBy?.trim() || "";
    if (!requestedBy) {
      toast.error("Sign in so we can send requestedBy.");
      return;
    }
    update.mutate(
      {
        id: purchaseRequisitionId,
        data: {
          tenantId: data.tenantId,
          requestedBy,
          department: data.department.trim(),
          justification: data.justification.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Purchase requisition updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/purchase-requisitions/${purchaseRequisitionId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update purchase requisition."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !requisition) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Purchase requisition not found.</p>
        <Link href="/purchase-requisitions">
          <Button variant="outline">Back to Purchase Requisitions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/purchase-requisitions/${purchaseRequisitionId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit purchase requisition</h1>
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
            <Label htmlFor="department">Department</Label>
            <Input id="department" {...form.register("department")} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="justification">Justification</Label>
          <textarea
            id="justification"
            className={textAreaClass}
            rows={4}
            {...form.register("justification")}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="requestedBy">Requested by</Label>
          <Input
            id="requestedBy"
            value={sessionUserId(session) || requisition.requestedBy}
            readOnly
            disabled
          />
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Purchase requisition updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/purchase-requisitions/${purchaseRequisitionId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
